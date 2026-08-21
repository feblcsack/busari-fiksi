import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, MessageCircle, Scale } from "lucide-react"
import { BUSINESS_CONTACT_PHONE_DISPLAY, BUSINESS_CONTACT_PHONE_WA } from "../../components/layout/site-footer"

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat & Ketentuan penggunaan, kebijakan privasi, dan kontak resmi Busari.",
}

function Section({ n, id, title, children }: { n: number; id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-8 scroll-mt-6">
      <h2
        className="text-base font-bold mb-2 flex items-baseline gap-2"
        style={{ color: "#201A14" }}
      >
        <span style={{ color: "#6B4E2A" }}>{n}.</span> {title}
      </h2>
      <div className="text-[13.5px] leading-relaxed space-y-2" style={{ color: "#52432F" }}>
        {children}
      </div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF8F3", fontFamily: "Hanken Grotesk, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(to bottom, #F3E0CC, #FFF8F3)", borderBottom: "1px solid #D5C3B0" }}>
        <div className="max-w-3xl mx-auto px-5 md:px-10 pt-8 pb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs mb-6 hover:underline" style={{ color: "#6B4E2A" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(107,78,42,0.08)", border: "1px solid rgba(107,78,42,0.18)" }}>
            <Scale className="w-3.5 h-3.5" style={{ color: "#6B4E2A" }} strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#6B4E2A" }}>Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-normal mb-2"
            style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
            Syarat &amp; Ketentuan
          </h1>
          <p className="text-sm" style={{ color: "#867462" }}>
            Terakhir diperbarui: 21 Agustus 2026
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-10">
        <div className="rounded-2xl p-6 md:p-10" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>

          <p className="text-[13.5px] leading-relaxed mb-8" style={{ color: "#52432F" }}>
            Selamat datang di Busari (&ldquo;Situs&rdquo;, &ldquo;kami&rdquo;). Busari adalah platform etalase
            digital yang mempertemukan pelaku UMKM (&ldquo;Penjual&rdquo;) dengan pembeli (&ldquo;Pembeli&rdquo;
            atau &ldquo;Anda&rdquo;). Dengan mengakses atau menggunakan Situs ini, Anda menyatakan telah
            membaca, memahami, dan menyetujui seluruh syarat dan ketentuan di bawah ini.
          </p>

          <Section n={1} title="Ketentuan Penggunaan">
            <p>
              Penggunaan Situs ini tunduk pada penerimaan Anda terhadap seluruh syarat, ketentuan, dan
              pemberitahuan yang tercantum atau dirujuk di sini, termasuk syarat dan ketentuan tambahan
              yang berlaku pada halaman atau bagian tertentu dari Situs.
            </p>
          </Section>

          <Section n={2} title="Tinjauan Umum">
            <p>
              Dengan menggunakan Situs ini, Anda menyatakan setuju terhadap seluruh syarat, ketentuan, dan
              pemberitahuan yang berlaku. Mohon dibaca dengan saksama. Jika Anda tidak menyetujui Syarat
              dan Ketentuan ini, Anda diharap untuk segera keluar dari Situs dan tidak melanjutkan
              penggunaan informasi atau layanan dari Situs ini.
            </p>
          </Section>

          <Section n={3} title="Perubahan Situs dan Syarat & Ketentuan">
            <p>
              Busari berhak untuk mengubah, memodifikasi, memperbarui, atau menghentikan syarat, ketentuan,
              serta konten, informasi, harga, dan materi lain yang ditawarkan melalui Situs ini sewaktu-waktu
              tanpa pemberitahuan sebelumnya, kecuali diwajibkan lain oleh peraturan yang berlaku. Kami
              berhak menyesuaikan harga dari waktu ke waktu. Apabila terjadi kesalahan penulisan harga,
              Busari berhak untuk membatalkan pesanan terkait.
            </p>
          </Section>

          <Section n={4} title="Hak Cipta">
            <p>
              Situs ini dimiliki dan dioperasikan oleh Busari. Kecuali dinyatakan lain, seluruh materi,
              merek dagang, merek layanan, dan logo di Situs ini adalah milik Busari atau Penjual terkait,
              dan dilindungi oleh undang-undang hak cipta Indonesia serta hukum internasional yang berlaku.
              Materi yang dipublikasikan oleh Busari tidak boleh disalin, direproduksi, dimodifikasi,
              dipublikasikan ulang, diunggah, atau didistribusikan tanpa izin tertulis sebelumnya.
            </p>
          </Section>

          <Section n={5} title="Pendaftaran Akun">
            <p>
              Untuk melakukan pembelian atau menjadi Penjual, Anda perlu mendaftar dengan memberikan
              informasi yang akurat dan terkini. Anda bertanggung jawab penuh atas kerahasiaan akun Anda
              serta seluruh aktivitas yang terjadi di bawah akun tersebut. Anda dilarang menyalahgunakan
              atau membagikan kredensial akun, atau meniru identitas pihak lain.
            </p>
          </Section>

          <Section n={6} title="Komunikasi Elektronik">
            <p>
              Dengan menggunakan Situs ini, Anda setuju bahwa Busari dapat mengirimkan email atau pesan
              elektronik lainnya sehubungan dengan pesanan, pembaruan layanan, atau informasi produk. Anda
              dapat berhenti berlangganan komunikasi non-transaksional kapan saja melalui pengaturan akun.
            </p>
          </Section>

          <Section n={7} title="Deskripsi Produk & Tanggung Jawab Penjual">
            <p>
              Produk yang ditampilkan di Situs ini diunggah dan dikelola secara mandiri oleh masing-masing
              Penjual UMKM. Kami berupaya menampilkan informasi dan gambar produk seakurat mungkin, namun
              tidak dapat menjamin bahwa tampilan warna pada perangkat Anda akan sama persis dengan produk
              aslinya. Deskripsi, kualitas, dan ketersediaan produk merupakan tanggung jawab Penjual
              masing-masing.
            </p>
          </Section>

          <Section n={8} title="Pembayaran">
            <p>
              Busari menyediakan dua metode checkout: (a) pembayaran instan melalui payment gateway pihak
              ketiga yang telah tersertifikasi (mendukung QRIS, e-wallet, dan metode pembayaran instan
              lainnya), diproses secara real-time dan aman menggunakan enkripsi standar industri; dan
              (b) konfirmasi pesanan manual melalui WhatsApp untuk metode pembayaran alternatif. Seluruh
              transaksi pembayaran instan diproses oleh mitra payment gateway kami dan tidak pernah
              menyimpan data kartu atau kredensial pembayaran Anda di server kami.
            </p>
          </Section>

          <Section n={9} title="Ketentuan Pengembalian">
            <ul className="list-disc pl-5 space-y-1">
              <li>Pengembalian barang dapat diajukan maksimal 7 hari sejak barang diterima.</li>
              <li>Barang harus dalam kondisi asli dan belum digunakan.</li>
              <li>Label/tag produk masih lengkap.</li>
              <li>Produk yang dibeli saat promo/diskon khusus tidak dapat dikembalikan.</li>
            </ul>
            <p>Biaya pengiriman pengembalian ditanggung oleh pihak yang mengajukan, kecuali kesalahan berasal dari Penjual.</p>
          </Section>

          <Section n={10} id="privasi" title="Kebijakan Privasi">
            <p>
              Informasi Anda aman bersama kami. Busari memahami bahwa privasi adalah hal yang sangat
              penting. Data pribadi yang Anda berikan (nama, email, nomor telepon, alamat pengiriman) hanya
              digunakan untuk memproses pesanan, komunikasi transaksional, dan peningkatan layanan. Kami
              tidak akan menjual, menyalahgunakan, atau membagikan data pribadi Anda kepada pihak ketiga
              yang tidak berkepentingan, kecuali kepada mitra payment gateway (semata untuk memproses
              pembayaran) atau apabila diwajibkan oleh hukum yang berlaku.
            </p>
          </Section>

          <Section n={11} title="Ganti Rugi (Indemnity)">
            <p>
              Anda setuju untuk membebaskan dan melindungi Busari dari segala klaim, kewajiban, kerugian,
              atau biaya (termasuk biaya hukum yang wajar) yang timbul dari atau sehubungan dengan akses
              dan/atau penggunaan Situs ini oleh Anda.
            </p>
          </Section>

          <Section n={12} title="Penafian (Disclaimer)">
            <p>
              Busari tidak bertanggung jawab atas keakuratan, kebenaran, ketepatan waktu, atau kelengkapan
              materi yang disediakan Penjual di Situs ini. Anda tidak boleh berasumsi bahwa materi di Situs
              ini senantiasa diperbarui atau memuat informasi terkini.
            </p>
          </Section>

          <Section n={13} title="Hukum yang Berlaku">
            <p>Syarat dan Ketentuan ini tunduk dan diatur oleh hukum yang berlaku di Republik Indonesia.</p>
          </Section>

          <Section n={14} title="Kontak &amp; Pertanyaan">
            <p>
              Kami menyambut baik pertanyaan, masukan, atau keluhan terkait privasi, transaksi, atau hal
              lain terkait Situs ini. Silakan hubungi kontak resmi kami di bawah ini:
            </p>
            <a
              href={`https://wa.me/${BUSINESS_CONTACT_PHONE_WA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-95"
              style={{ background: "#6B4E2A", color: "#FFF8F3" }}
            >
              <MessageCircle className="w-4 h-4" strokeWidth={2} />
              Hubungi Kami: {BUSINESS_CONTACT_PHONE_DISPLAY}
            </a>
          </Section>

          <div className="pt-6 mt-8 text-[11px]" style={{ borderTop: "1px solid #D5C3B0", color: "#867462" }}>
            <p>Busari adalah platform yang dioperasikan secara independen di Indonesia.</p>
            <p>Hak Cipta © 2026 Busari. Seluruh hak dilindungi.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
