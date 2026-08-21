import { MIDTRANS_IS_PRODUCTION } from "@/lib/midtrans-client"

export { MIDTRANS_IS_PRODUCTION, MIDTRANS_SNAP_JS_URL } from "@/lib/midtrans-client"

const SNAP_BASE_URL = MIDTRANS_IS_PRODUCTION
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

// Guard against the classic footgun: sandbox key deployed with production
// flag on (or vice versa). Midtrans prefixes keys with "SB-" for sandbox.
function assertKeyMatchesEnvironment(serverKey: string) {
  const looksLikeSandboxKey = serverKey.startsWith("SB-")
  
  // Strict check: Production mode MUST use production key
  if (MIDTRANS_IS_PRODUCTION && looksLikeSandboxKey) {
    throw new Error(
      "MIDTRANS_SERVER_KEY yang terpasang adalah SANDBOX key, tapi NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true. " +
      "Ganti dengan Production Server Key dari dashboard.midtrans.com sebelum menerima pembayaran sungguhan."
    )
  }
  
  // Lenient check: Sandbox mode with production key - just warn in console
  if (!MIDTRANS_IS_PRODUCTION && !looksLikeSandboxKey) {
    console.warn(
      "⚠️ WARNING: MIDTRANS_SERVER_KEY terlihat seperti Production key, tapi NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION='false'. " +
      "Untuk testing yang lebih aman, gunakan Sandbox key dari dashboard.sandbox.midtrans.com. " +
      "Transaksi akan tetap diproses menggunakan sandbox endpoint."
    )
  }
}

export async function createSnapTransaction(
  params: CreateSnapParams
): Promise<{ token: string; redirect_url: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum di-set di environment")
  assertKeyMatchesEnvironment(serverKey)

  const auth = Buffer.from(`${serverKey}:`).toString("base64")

  let res: Response
  try {
    res = await fetch(SNAP_BASE_URL, {
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
      // Don't let a slow/hanging Midtrans call hang the checkout forever.
      signal: AbortSignal.timeout(15000),
    })
  } catch (err) {
    console.error("Midtrans Snap API unreachable:", err)
    throw new Error("Tidak dapat menghubungi server pembayaran Midtrans. Coba lagi sebentar.")
  }

  const data = await res.json().catch(() => null)

  if (!res.ok || !data) {
    const message = data?.error_messages?.join(", ") ?? `Gagal membuat transaksi Midtrans (HTTP ${res.status})`
    console.error("Midtrans createSnapTransaction failed:", res.status, data)
    throw new Error(message)
  }

  if (!data.token || !data.redirect_url) {
    console.error("Midtrans response missing token/redirect_url:", data)
    throw new Error("Respons Midtrans tidak lengkap, transaksi dibatalkan")
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