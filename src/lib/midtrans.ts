const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
const SNAP_BASE_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions"

interface SnapItem {
  id: string
  price: number
  quantity: number
  name: string
}

interface CreateSnapParams {
  orderId: string
  grossAmount: number
  customerName: string
  customerEmail: string
  items: SnapItem[]
}

export async function createSnapTransaction(
  params: CreateSnapParams
): Promise<{ token: string; redirect_url: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum di-set di environment")

  const auth = Buffer.from(`${serverKey}:`).toString("base64")

  const res = await fetch(SNAP_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      credit_card: { secure: true },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
      item_details: params.items,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error_messages?.join(", ") ?? "Gagal membuat transaksi Midtrans")
  }

  return { token: data.token, redirect_url: data.redirect_url }
}

// ── Verifikasi signature dari notification webhook ─────────────────────────
import { createHash } from "crypto"

export function verifySignature(params: {
  orderId: string
  statusCode: string
  grossAmount: string
  signatureKey: string
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) return false

  const raw = `${params.orderId}${params.statusCode}${params.grossAmount}${serverKey}`
  const expected = createHash("sha512").update(raw).digest("hex")
  return expected === params.signatureKey
}