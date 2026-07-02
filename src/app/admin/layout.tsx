import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Profile } from "@/types"

export const metadata = {
  title: "Admin — Busari",
  description: "Admin panel untuk mengelola produk dan pengguna Busari.",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
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
