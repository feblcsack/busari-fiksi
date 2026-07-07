import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { verifySignature } from "@/lib/midtrans"
import { OrderItem } from "@/types"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const isValid = verifySignature({
      orderId: body.order_id,
      statusCode: body.status_code,
      grossAmount: body.gross_amount,
      signatureKey: body.signature_key,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Use service role key to bypass RLS for webhook operations
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const transactionStatus = body.transaction_status
    const fraudStatus = body.fraud_status

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

    // Fetch current order to check previous status
    const { data: order } = await supabase
      .from("orders")
      .select("status, items")
      .eq("order_code", body.order_id)
      .single()

    const updateData: Record<string, unknown> = {
      status: newStatus,
      midtrans_transaction_id: body.transaction_id,
      midtrans_payment_type: body.payment_type,
    }
    if (newStatus === "paid") updateData.paid_at = new Date().toISOString()

    await supabase.from("orders").update(updateData).eq("order_code", body.order_id)

    // Reduce stock when payment is confirmed (only once — check previous status wasn't already paid)
    if (newStatus === "paid" && order && order.status !== "paid" && order.status !== "completed") {
      const items = order.items as OrderItem[]
      for (const item of items) {
        // Decrement stock atomically using RPC — only if stock is tracked (not null)
        await supabase.rpc("decrement_product_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Midtrans notification error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
