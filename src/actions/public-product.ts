"use server"

import { createClient } from "@/lib/supabase/server"

export interface PublicProduct {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  created_at: string
  user_id: string
  // joined from profiles table
  seller_name?: string | null
  seller_whatsapp?: string | null
}

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  reviewer_name?: string | null
}

export async function getPublicProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      profiles:user_id (
        full_name,
        whatsapp_number
      )
    `
    )
    .order("created_at", { ascending: false })

  if (error) return []

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image_url: row.image_url,
    created_at: row.created_at,
    user_id: row.user_id,
    seller_name: row.profiles?.full_name ?? null,
    seller_whatsapp: row.profiles?.whatsapp_number ?? null,
  }))
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (error) return []
  return data || []
}

export async function submitReview(
  productId: string,
  rating: number,
  comment: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Check if already reviewed
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .single()

  if (existing) {
    const { error } = await supabase
      .from("reviews")
      .update({ rating, comment, updated_at: new Date().toISOString() })
      .eq("id", existing.id)

    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
    })

    if (error) throw new Error(error.message)
  }

  return { success: true }
}