// src/app/shop/page.tsx
// Server component — fetch products, profile, and initial cart items

import { createClient } from "@/lib/supabase/server"
import { getPublicProducts } from "@/actions/public-product"
import { getCart } from "@/actions/cart"
import { ShopClient } from "../../components/shop/shop-client"
import { Profile } from "@/types"

export default async function ShopPage() {
  // Fetch produk, supabase client, dan cart secara parallel
  const [products, supabase] = await Promise.all([
    getPublicProducts(),
    createClient(),
  ])

  // Ambil user — null kalau belum login, tidak redirect
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  }

  // Ambil cart items kalau user login
  const initialCartItems = user ? await getCart() : []

  return (
    <ShopClient
      initialProducts={products}
      profile={profile}
      initialCartItems={initialCartItems}
    />
  )
}
