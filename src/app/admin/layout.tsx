import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Profile } from "@/types"
import { Shield, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Admin — Busari",
  description: "Admin panel untuk mengelola produk dan pengguna Busari.",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/")

  // Fetch profile including role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // If profile query failed (e.g. column doesn't exist), show setup instructions
  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#FFF8F3" }}>
        <div className="max-w-lg w-full rounded-2xl p-8" style={{ border: "1px solid #D5C3B0", background: "#FDF3EC" }}>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6" style={{ color: "#BA1A1A" }} />
            <h1 className="text-xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              Setup Diperlukan
            </h1>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#52432F" }}>
            Tabel database belum siap. Jalankan SQL migration terlebih dahulu di Supabase Dashboard.
          </p>
          <p className="text-sm font-semibold mb-2" style={{ color: "#201A14" }}>Langkah:</p>
          <ol className="text-sm space-y-1 list-decimal list-inside" style={{ color: "#52432F" }}>
            <li>Buka file <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(107,78,42,0.1)", color: "#6B4E2A" }}>ADMIN_SETUP.md</code> di root project</li>
            <li>Jalankan SQL migration di Supabase Dashboard → SQL Editor</li>
            <li>Set role admin untuk akun Anda</li>
            <li>Refresh halaman ini</li>
          </ol>
        </div>
      </div>
    )
  }

  // Check admin role — redirect non-admin users
  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#FFF8F3" }}>
        <div className="max-w-md w-full rounded-2xl p-8 text-center" style={{ border: "1px solid #D5C3B0", background: "#FDF3EC" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(186,26,26,0.08)" }}>
            <Shield className="w-7 h-7" style={{ color: "#BA1A1A" }} />
          </div>
          <h1 className="text-2xl font-normal mb-2" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
            Akses Ditolak
          </h1>
          <p className="text-sm mb-6" style={{ color: "#867462" }}>
            Akun ini tidak memiliki hak akses admin. Hubungi administrator untuk mendapatkan akses.
          </p>
          <p className="text-xs mb-2" style={{ color: "#D5C3B0" }}>
            Login sebagai: <span style={{ color: "#52432F" }}>{profile?.email ?? user.email}</span>
          </p>
          <a href="/dashboard" className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-95"
            style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}>
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FFF8F3", fontFamily: "Hanken Grotesk, sans-serif" }}>
      <AdminSidebar profile={profile as Profile} />
      <main className="flex-1 min-w-0 md:ml-64">
        {children}
      </main>
    </div>
  )
}
