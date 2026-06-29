// src/app/shop/page.tsx
// Server component — fetch profile kalau user login, pass ke BottomNav

import { createClient } from "@/lib/supabase/server"
import { getPublicProducts } from "@/actions/public-product"
import { ShopClient } from "../../components/shop/shop-client"
import { Profile } from "@/types"

export default async function ShopPage() {
  // Fetch produk dan profile secara parallel
  const [products, supabase] = await Promise.all([
    getPublicProducts(),
    createClient(),
  ])

  // Ambil user — null kalau belum login, tidak redirect
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  }

  return <ShopClient initialProducts={products} profile={profile} />
}