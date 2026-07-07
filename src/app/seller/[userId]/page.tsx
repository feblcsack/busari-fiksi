import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Profile } from "@/types"
import { SellerProfileClient } from "@/components/seller/seller-profile-client"

interface Props {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  const supabase = await createClient()
  const { data: seller } = await supabase
    .from("profiles")
    .select("full_name, bio")
    .eq("id", userId)
    .single()

  if (!seller) return { title: "Seller tidak ditemukan — Busari" }

  return {
    title: `${seller.full_name ?? "Seller"} — Busari`,
    description: seller.bio ?? `Lihat produk dari ${seller.full_name ?? "seller"} di Busari.`,
  }
}

export default async function SellerProfilePage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()

  // Fetch seller profile + their approved products + current user in parallel
  const [sellerResult, productsResult, authResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ])

  if (sellerResult.error || !sellerResult.data) notFound()

  const seller = sellerResult.data as Profile
  const products = productsResult.data ?? []
  const currentUser = authResult.data.user

  let currentProfile: Profile | null = null
  if (currentUser) {
    const { data } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()
    currentProfile = data
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#FFF8F3" }}>
      <SellerProfileClient seller={seller} products={products} />
      <BottomNav profile={currentProfile} />
    </div>
  )
}
