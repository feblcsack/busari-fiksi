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

  // Ambil semua produk milik user, termasuk status review
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
    // Validate type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error("Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.")
    }
    // Max 10MB for product images
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error("Ukuran gambar maksimal 10MB.")
    }

    const fileExt = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // Convert File menjadi Buffer biar bisa dibaca di environment Server Node.js
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // Upload ke bucket "images"
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: true,
      })

    if (uploadError) throw new Error(uploadError.message)

    // Dapatkan URL publik dari bucket "images"
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
    status: "pending", // semua produk baru masuk antrian review admin
  })

  if (error) throw new Error(error.message)

  // Revalidate secara 'layout' biar UI langsung update
  revalidatePath("/dashboard", "layout")
  revalidatePath("/dashboard/products")
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

  const updateData: Partial<Product> & { status: string; review_note: null } = {
    name,
    description,
    price,
    // Setiap kali seller edit, produk kembali ke pending untuk review ulang
    status: "pending",
    review_note: null,
  }

  if (imageFile && imageFile.size > 0) {
    // Validate type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error("Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.")
    }
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error("Ukuran gambar maksimal 10MB.")
    }

    const fileExt = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // Convert File menjadi Buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // Upload ke bucket "images"
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: true,
      })

    if (uploadError) throw new Error(uploadError.message)

    // Dapatkan URL publik dari bucket "images"
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

  // Revalidate secara 'layout'
  revalidatePath("/dashboard", "layout")
  revalidatePath("/dashboard/products")
  revalidatePath("/admin/product-reviews")
  revalidatePath("/admin/reviews")
  revalidatePath("/shop")
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
    // Hapus dari bucket "images"
    await supabase.storage.from("images").remove([fileName])
  }

  // Revalidate secara 'layout'
  revalidatePath("/dashboard", "layout")
  return { success: true }
}