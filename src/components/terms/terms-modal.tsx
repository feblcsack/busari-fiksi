"use client"

import { useState, useEffect } from "react"
import { X, Scale, ExternalLink } from "lucide-react"
import Link from "next/link"

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  mode?: "info" | "consent" // info = just view, consent = must accept
  title?: string
  description?: string
}

export function TermsModal({ 
  isOpen, 
  onClose, 
  onAccept,
  mode = "info",
  title,
  description
}: TermsModalProps) {
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setHasScrolled(false)
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const scrollPercentage = (element.scrollTop + element.clientHeight) / element.scrollHeight
    if (scrollPercentage > 0.8) {
      setHasScrolled(true)
    }
  }

  const handleAccept = () => {
    if (onAccept) {
      onAccept()
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(32,26,20,0.75)" }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col"
        style={{ backgroundColor: "#FFF8F3" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-start justify-between p-5 border-b"
          style={{ borderColor: "#D5C3B0" }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5" style={{ color: "#6B4E2A" }} strokeWidth={2} />
              <h2 
                className="text-xl font-normal"
                style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}
              >
                {title || "Syarat & Ketentuan"}
              </h2>
            </div>
            {description && (
              <p className="text-sm" style={{ color: "#867462" }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: "#6B4E2A" }} />
          </button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed"
          style={{ color: "#52432F" }}
          onScroll={mode === "consent" ? handleScroll : undefined}
        >
          <p className="mb-4">
            Selamat datang di <strong>Busari</strong>. Dengan mengakses atau menggunakan platform ini, 
            Anda menyetujui syarat dan ketentuan berikut:
          </p>

          <div className="space-y-4">
            <section>
              <h3 className="font-bold mb-2" style={{ color: "#201A14" }}>1. Ketentuan Penggunaan</h3>
              <p>
                Penggunaan Situs ini tunduk pada penerimaan Anda terhadap seluruh syarat, ketentuan, 
                dan pemberitahuan yang tercantum. Jika tidak setuju, harap keluar dari Situs.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: "#201A14" }}>2. Pendaftaran Akun</h3>
              <p>
                Anda bertanggung jawab atas kerahasiaan akun dan seluruh aktivitas di bawah akun Anda. 
                Informasi yang diberikan harus akurat dan terkini.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: "#201A14" }}>3. Pembayaran</h3>
              <p>
                Kami menyediakan pembayaran instan melalui payment gateway tersertifikasi (QRIS, e-wallet) 
                dan konfirmasi manual via WhatsApp. Transaksi diproses dengan enkripsi standar industri.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: "#201A14" }}>4. Tanggung Jawab Penjual</h3>
              <p>
                Produk ditampilkan dan dikelola oleh Penjual UMKM. Deskripsi, kualitas, dan ketersediaan 
                produk adalah tanggung jawab Penjual masing-masing.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: "#201A14" }}>5. Kebijakan Privasi</h3>
              <p>
                Data pribadi Anda (nama, email, nomor telepon, alamat) hanya digunakan untuk memproses 
                pesanan dan komunikasi transaksional. Kami tidak menjual atau membagikan data Anda kepada 
                pihak ketiga yang tidak berkepentingan.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: "#201A14" }}>6. Ketentuan Pengembalian</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Pengembalian dapat diajukan maksimal 7 hari sejak barang diterima</li>
                <li>Barang harus dalam kondisi asli dan belum digunakan</li>
                <li>Label/tag produk masih lengkap</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: "#201A14" }}>7. Penafian</h3>
              <p>
                Busari tidak bertanggung jawab atas keakuratan informasi yang disediakan Penjual. 
                Platform ini tunduk pada hukum Republik Indonesia.
              </p>
            </section>
          </div>

          <div className="mt-6 pt-4 border-t" style={{ borderColor: "#D5C3B0" }}>
            <Link 
              href="/terms" 
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              style={{ color: "#6B4E2A" }}
            >
              Baca selengkapnya
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs" style={{ color: "#867462" }}>
            Terakhir diperbarui: 21 Agustus 2026
          </p>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-5 border-t"
          style={{ borderColor: "#D5C3B0" }}
        >
          {mode === "info" ? (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-semibold transition-all hover:brightness-95"
              style={{ backgroundColor: "#6B4E2A", color: "#FFF8F3" }}
            >
              Mengerti
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-medium transition-all hover:bg-black/5"
                style={{ color: "#6B4E2A" }}
              >
                Nanti Saja
              </button>
              <button
                onClick={handleAccept}
                disabled={!hasScrolled}
                className="px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-95"
                style={{ backgroundColor: "#6B4E2A", color: "#FFF8F3" }}
              >
                Saya Setuju
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
