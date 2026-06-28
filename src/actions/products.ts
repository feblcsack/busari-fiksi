"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Product } from "@/types"

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return []
  return data || []
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  return data
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseInt(formData.get("price") as string, 10)
  const imageFile = formData.get("image") as File | null

  let image_url: string | null = null

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // FIX: Convert File menjadi Buffer biar bisa dibaca di environment Server Node.js
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // FIX BUCKET NAME: Ganti dari "products" ke "images"
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, buffer, {
        contentType: imageFile.type, // FIX: Kasih tau Supabase MIME type gambarnya
        upsert: true,
      })

    if (uploadError) throw new Error(uploadError.message)

    // FIX BUCKET NAME: Ganti dari "products" ke "images"
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName)

    image_url = urlData.publicUrl
  }

  const { error } = await supabase.from("products").insert({
    user_id: user.id,
    name,
    description,
    price,
    image_url,
  })

  if (error) throw new Error(error.message)

  // FIX: Revalidate secara 'layout' biar UI langsung update
  revalidatePath("/dashboard", "layout")
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseInt(formData.get("price") as string, 10)
  const imageFile = formData.get("image") as File | null

  const updateData: Partial<Product> = { name, description, price }

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // FIX: Convert File menjadi Buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // FIX BUCKET NAME: Ganti dari "products" ke "images"
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, buffer, {
        contentType: imageFile.type, // FIX: Tambahin contentType
        upsert: true,
      })

    if (uploadError) throw new Error(uploadError.message)

    // FIX BUCKET NAME: Ganti dari "products" ke "images"
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName)

    updateData.image_url = urlData.publicUrl
  }

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  // FIX: Revalidate secara 'layout'
  revalidatePath("/dashboard", "layout")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Get product to delete image
  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  // Delete image from storage if exists
  if (product?.image_url) {
    const urlParts = product.image_url.split("/")
    const fileName = urlParts[urlParts.length - 1]
    // FIX BUCKET NAME: Ganti dari "products" ke "images"
    await supabase.storage.from("images").remove([fileName])
  }

  // FIX: Revalidate secara 'layout'
  revalidatePath("/dashboard", "layout")
  return { success: true }
}