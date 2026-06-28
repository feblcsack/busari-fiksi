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
  // joined from profiles table if you have one
  seller_name?: string | null
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
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return []
  return data || []
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
    // Update existing review
    const { error } = await supabase
      .from("reviews")
      .update({ rating, comment, updated_at: new Date().toISOString() })
      .eq("id", existing.id)

    if (error) throw new Error(error.message)
  } else {
    // Insert new review
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