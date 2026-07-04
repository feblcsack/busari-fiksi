"use client"

import { CheckCircle2, Download } from "lucide-react"
import { formatPrice, formatDate } from "@/lib/utils"
import { CartItem } from "@/types"

export interface ReceiptData {
  orderCode: string
  items: CartItem[]
  totalAmount: number
  paymentMethod: "midtrans" | "whatsapp"
  createdAt: string
  customerName?: string | null
}

interface ReceiptModalProps {
  data: ReceiptData | null
  onClose: () => void
}

export function ReceiptModal({ data, onClose }: ReceiptModalProps) {
  if (!data) return null

  const handleDownloadPdf = async () => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ unit: "mm", format: "a5" })

    const marginX = 15
    const rightX = 148 - marginX
    let y = 20

    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("BUSARI", marginX, y)
    y += 6
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Bukti Pembayaran", marginX, y)

    y += 10
    doc.setDrawColor(200)
    doc.line(marginX, y, rightX, y)
    y += 8

    doc.setFontSize(9)
    doc.text("No. Order", marginX, y)
    doc.text(data.orderCode, 60, y)
    y += 6
    doc.text("Tanggal", marginX, y)
    doc.text(formatDate(data.createdAt), 60, y)
    y += 6
    doc.text("Metode", marginX, y)
    doc.text(data.paymentMethod === "midtrans" ? "QRIS (Midtrans)" : "WhatsApp", 60, y)
    if (data.customerName) {
      y += 6
      doc.text("Pelanggan", marginX, y)
      doc.text(data.customerName, 60, y)
    }

    y += 10
    doc.line(marginX, y, rightX, y)
    y += 8

    doc.setFont("helvetica", "bold")
    doc.text("Item", marginX, y)
    doc.text("Qty", 90, y)
    doc.text("Subtotal", rightX, y, { align: "right" })
    doc.setFont("helvetica", "normal")
    y += 6

    data.items.forEach((item) => {
      const subtotal = item.price_at_addition * item.quantity
      const name = item.name.length > 30 ? item.name.slice(0, 30) + "…" : item.name
      doc.text(name, marginX, y)
      doc.text(String(item.quantity), 90, y)
      doc.text(formatPrice(subtotal), rightX, y, { align: "right" })
      y += 6
    })

    y += 4
    doc.line(marginX, y, rightX, y)
    y += 8

    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Total", marginX, y)
    doc.text(formatPrice(data.totalAmount), rightX, y, { align: "right" })

    y += 14
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text("Terima kasih telah berbelanja di Busari.", marginX, y)

    doc.save(`Receipt-${data.orderCode}.pdf`)
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(32,26,20,0.5)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "#FFF8F3", border: "1px solid #D5C3B0", fontFamily: "Hanken Grotesk, sans-serif" }}
      >
        <div
          className="flex flex-col items-center pt-8 pb-5 px-6"
          style={{ background: "rgba(92,96,41,0.06)", borderBottom: "1px solid rgba(107,78,42,0.1)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ background: "rgba(92,96,41,0.12)" }}
          >
            <CheckCircle2 className="w-7 h-7" style={{ color: "#5C6029" }} strokeWidth={2} />
          </div>
          <p className="text-lg" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
            Pembayaran Berhasil
          </p>
          <p className="text-xs mt-1" style={{ color: "#867462" }}>{data.orderCode}</p>
        </div>

        <div className="px-6 py-5 max-h-64 overflow-y-auto space-y-2.5">
          {data.items.map((item) => (
            <div key={item.product_id} className="flex justify-between text-sm">
              <span style={{ color: "#52432F" }}>
                {item.name} <span style={{ color: "#867462" }}>x{item.quantity}</span>
              </span>
              <span style={{ color: "#201A14", fontWeight: 500 }}>
                {formatPrice(item.price_at_addition * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="px-6 py-4" style={{ borderTop: "1px solid rgba(107,78,42,0.1)" }}>
          <div className="flex justify-between mb-5">
            <span className="text-sm font-semibold" style={{ color: "#201A14" }}>Total Dibayar</span>
            <span className="text-base font-bold" style={{ color: "#6B4E2A" }}>{formatPrice(data.totalAmount)}</span>
          </div>
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] mb-2"
            style={{ background: "#6B4E2A" }}
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Download Receipt (PDF)
          </button>
          <button
            onClick={onClose}
            className="w-full text-center text-xs py-2 rounded-xl transition-all hover:bg-black/5"
            style={{ color: "#867462" }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}