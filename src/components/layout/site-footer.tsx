import Link from "next/link"
import { MessageCircle } from "lucide-react"

// Contact person yang didaftarkan sebagai kontak resmi bisnis (dibutuhkan
// untuk proses approval payment gateway / Midtrans production).
export const BUSINESS_CONTACT_PHONE_DISPLAY = "+62 878-8505-1961"
export const BUSINESS_CONTACT_PHONE_WA = "6287885051961"

interface SiteFooterProps {
  /** Compact = satu baris tipis untuk halaman internal/dashboard.
   *  Full = versi lebih lengkap untuk halaman publik. */
  variant?: "compact" | "full"
}

export function SiteFooter({ variant = "compact" }: SiteFooterProps) {
  const year = new Date().getFullYear()

  if (variant === "compact") {
    return (
      <footer
        className="mt-auto"
        style={{ borderTop: "1px solid #D5C3B0", backgroundColor: "#ECE1D8" }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]" style={{ color: "#867462" }}>
          <p>© {year} Busari. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline" style={{ color: "#6B4E2A" }}>
              Syarat &amp; Ketentuan
            </Link>
            <Link href="/terms#privasi" className="hover:underline" style={{ color: "#6B4E2A" }}>
              Kebijakan Privasi
            </Link>
            <a
              href={`https://wa.me/${BUSINESS_CONTACT_PHONE_WA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
              style={{ color: "#6B4E2A" }}
            >
              <MessageCircle className="w-3 h-3" strokeWidth={2} />
              {BUSINESS_CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer style={{ borderTop: "1px solid #D5C3B0", backgroundColor: "#ECE1D8" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-xs">
          <div className="text-xl tracking-[0.2em] mb-2" style={{ fontFamily: "Libre Caslon Text, serif", color: "#6B4E2A" }}>
            BUSARI
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#52432F" }}>
            Platform fashion artisanal Indonesia yang menghubungkan pengrajin UMKM dengan pembeli.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>
            Legal
          </p>
          <Link href="/terms" className="hover:underline" style={{ color: "#52432F" }}>
            Syarat &amp; Ketentuan
          </Link>
          <Link href="/terms#privasi" className="hover:underline" style={{ color: "#52432F" }}>
            Kebijakan Privasi
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>
            Hubungi Kami
          </p>
          <a
            href={`https://wa.me/${BUSINESS_CONTACT_PHONE_WA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
            style={{ color: "#52432F" }}
          >
            <MessageCircle className="w-3.5 h-3.5" style={{ color: "#6B4E2A" }} strokeWidth={2} />
            {BUSINESS_CONTACT_PHONE_DISPLAY}
          </a>
          {/* TODO: ganti dengan email bisnis resmi kalau sudah ada, lalu un-comment:
          <a href="mailto:isi-email-lo@domain.com" className="flex items-center gap-2 hover:underline" style={{ color: "#52432F" }}>
            <Mail className="w-3.5 h-3.5" style={{ color: "#6B4E2A" }} strokeWidth={2} />
            isi-email-lo@domain.com
          </a> */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-4 text-[11px]" style={{ borderTop: "1px solid #D5C3B0", color: "#867462" }}>
        © {year} Busari Artisanal. Hak cipta dilindungi.
      </div>
    </footer>
  )
}
