import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { Profile } from "@/types"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  // Ambil profile buat pass ke BottomNav
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFF8F3" }}>
      {children}
      <SiteFooter />
      <BottomNav profile={profile as Profile | null} />
    </div>
  )
}
