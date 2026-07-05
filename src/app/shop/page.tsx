import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getPublicProducts } from "@/actions/public-product"
import { ShopClient } from "../../components/shop/shop-client"
import { Profile } from "@/types"

export const metadata: Metadata = {
  title: "Toko — Busari",
  description: "Temukan produk fashion UMKM lokal terbaik Indonesia. Batik, tenun, songket, dan karya pengrajin Nusantara.",
}

export default async function ShopPage() {
  const [products, supabase] = await Promise.all([
    getPublicProducts(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  return <ShopClient initialProducts={products} profile={profile} />
}
