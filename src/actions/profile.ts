"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Profile } from "@/types"

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return data
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const full_name = (formData.get("full_name") as string)?.trim() || null
  const bio = (formData.get("bio") as string)?.trim() || null
  const whatsapp_number_raw = formData.get("whatsapp_number") as string | null
  const avatarFile = formData.get("avatar") as File | null

  // Normalize WhatsApp: strip non-digits, null if empty
  const whatsapp_number = whatsapp_number_raw
    ? whatsapp_number_raw.replace(/\D/g, "") || null
    : null

  let avatar_url: string | undefined

  if (avatarFile && avatarFile.size > 0) {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(avatarFile.type)) {
      throw new Error("Format foto tidak didukung. Gunakan JPG, PNG, atau WEBP.")
    }

    // Validate file size (max 5MB)
    if (avatarFile.size > 5 * 1024 * 1024) {
      throw new Error("Ukuran foto maksimal 5MB.")
    }

    const fileExt = avatarFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
    // Use user.id as filename to overwrite old avatar (dedup)
    const fileName = `${user.id}.${fileExt}`

    // Convert File to Buffer — required in server action environment
    const buffer = Buffer.from(await avatarFile.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: avatarFile.type,
        upsert: true,
      })

    if (uploadError) throw new Error(`Upload gagal: ${uploadError.message}`)

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

    // Append cache-busting timestamp so browser reloads the new image
    avatar_url = `${urlData.publicUrl}?t=${Date.now()}`
  }

  const updateData: Partial<Profile> = { full_name, bio, whatsapp_number }
  if (avatar_url) updateData.avatar_url = avatar_url

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)

  if (error) throw new Error(error.message)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")

  return { success: true }
}
