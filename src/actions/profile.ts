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

  const full_name = formData.get("full_name") as string
  const bio = formData.get("bio") as string
  const whatsapp_number_raw = formData.get("whatsapp_number") as string | null
  const avatarFile = formData.get("avatar") as File | null

  // Normalize: strip everything except digits, store null when empty
  const whatsapp_number = whatsapp_number_raw
    ? whatsapp_number_raw.replace(/\D/g, "") || null
    : null

  let avatar_url: string | undefined

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${user.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { upsert: true })

    if (uploadError) throw new Error(uploadError.message)

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

    avatar_url = urlData.publicUrl
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
  revalidatePath("/katalog")

  return { success: true }
}