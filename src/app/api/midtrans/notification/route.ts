import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { verifySignature } from "@/lib/midtrans"
import { OrderItem } from "@/types"

// Orders in these states are final — a late/duplicate/out-of-order webhook
// notification must never overwrite them (e.g. an old "pending" notification
// arriving after we already marked the order "paid" or an admin "completed" it).
const FINAL_STATUSES = new Set(["completed", "paid", "cancelled", "failed", "expired"])

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    // Malformed payload — nothing we can do, ack so Midtrans stops retrying garbage.
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    const orderId = String(body.order_id ?? "")
    const statusCode = String(body.status_code ?? "")
    const grossAmount = String(body.gross_amount ?? "")
    const signatureKey = String(body.signature_key ?? "")

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const isValid = verifySignature({ orderId, statusCode, grossAmount, signatureKey })
    if (!isValid) {
      console.warn("Midtrans notification: invalid signature for order", orderId)
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Use service role key to bypass RLS for webhook operations
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch the order FIRST — we need its stored total to cross-check the
    // amount Midtrans is reporting, and its current status for idempotency.
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status, items, total_amount")
      .eq("order_code", orderId)
      .single()

    if (fetchError || !order) {
      // Order doesn't exist in our DB (e.g. stale/test notification). Acknowledge
      // with 200 so Midtrans doesn't keep retrying — but log it for visibility.
      console.warn("Midtrans notification: order not found for order_code", orderId)
      return NextResponse.json({ received: true, warning: "order not found" })
    }

    // ── Anti-tampering: verify the paid amount matches what we charged ──────
    // Signature proves the notification came from Midtrans, but not that the
    // amount wasn't altered upstream of signing (defense in depth). If these
    // don't match, treat it as suspicious and do not touch the order.
    const reportedAmount = Math.round(Number(grossAmount))
    const expectedAmount = Math.round(Number(order.total_amount))
    if (Number.isFinite(reportedAmount) && reportedAmount !== expectedAmount) {
      console.error(
        `Midtrans notification amount mismatch for ${orderId}: expected ${expectedAmount}, got ${reportedAmount}`
      )
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 })
    }

    const transactionStatus = String(body.transaction_status ?? "")
    const fraudStatus = String(body.fraud_status ?? "")

    let newStatus: string | null = null
    if (transactionStatus === "capture") {
      newStatus = fraudStatus === "accept" ? "paid" : "pending"
    } else if (transactionStatus === "settlement") {
      newStatus = "paid"
    } else if (transactionStatus === "pending") {
      newStatus = "pending"
    } else if (transactionStatus === "deny" || transactionStatus === "failure") {
      newStatus = "failed"
    } else if (transactionStatus === "expire") {
      newStatus = "expired"
    } else if (transactionStatus === "cancel") {
      newStatus = "cancelled"
    }

    if (!newStatus) {
      return NextResponse.json({ received: true })
    }

    // ── Idempotency / no-downgrade guard ────────────────────────────────────
    // If the order is already in a final state, only allow "paid" to move it
    // to "completed"-adjacent flows never happens here (admin does that).
    // Never let a late "pending"/"failed"/"expired" notification clobber an
    // order that's already paid/completed/cancelled.
    const alreadyFinal = FINAL_STATUSES.has(order.status)
    const isNoOpRepeat = order.status === newStatus
    if (isNoOpRepeat) {
      return NextResponse.json({ received: true, note: "status unchanged" })
    }
    if (alreadyFinal && newStatus !== "paid") {
      console.warn(
        `Midtrans notification ignored: order ${orderId} already '${order.status}', got late '${newStatus}'`
      )
      return NextResponse.json({ received: true, note: "order already finalized" })
    }
    if (order.status === "completed") {
      // Never downgrade a completed order, even to "paid".
      return NextResponse.json({ received: true, note: "order already completed" })
    }

    const updateData: Record<string, unknown> = {
      status: newStatus,
      midtrans_transaction_id: body.transaction_id,
      midtrans_payment_type: body.payment_type,
    }
    if (newStatus === "paid") updateData.paid_at = new Date().toISOString()

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("order_code", orderId)

    if (updateError) {
      console.error("Midtrans notification: failed to update order", orderId, updateError)
      // Return 500 so Midtrans retries the notification later.
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // Reduce stock when payment is confirmed for the first time.
    if (newStatus === "paid" && order.status !== "paid" && order.status !== "completed") {
      const items = (order.items as OrderItem[]) ?? []
      for (const item of items) {
        try {
          await supabase.rpc("decrement_product_stock", {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          })
        } catch (stockErr) {
          // Don't fail the whole webhook over one product's stock update —
          // the payment itself is already recorded as paid; log for manual fix.
          console.error(`Stock decrement failed for product ${item.product_id} on order ${orderId}:`, stockErr)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Midtrans notification error:", err)
    // 500 tells Midtrans to retry the notification later instead of losing it.
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
