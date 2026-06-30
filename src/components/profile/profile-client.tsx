"use client"

import { useState, useRef, useTransition } from "react"
import Image from "next/image"
import { Profile } from "@/types"
import { updateProfile } from "@/actions/profile"
import { showToast } from "@/components/ui/toast"
import { Camera, Loader2, User, Mail, FileText, MessageCircle } from "lucide-react"

interface ProfileClientProps {
  profile: Profile | null
  userEmail: string | null
}

export function ProfileClient({ profile, userEmail }: ProfileClientProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatar_url ?? null
  )
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (userEmail?.[0] ?? "U").toUpperCase()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 5MB", "error")
      return
    }
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await updateProfile(fd)
        showToast("Profil berhasil diperbarui", "success")
      } catch {
        showToast("Gagal memperbarui profil", "error")
      }
    })
  }

  return (
    <div
      className="min-h-screen py-10 px-4 md:px-8"
      style={{ background: "#111009", fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="mb-8">
          <p
            className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2"
            style={{ color: "#F5C451", opacity: 0.8 }}
          >
            Akun
          </p>
          <h1
            className="text-2xl font-normal"
            style={{ color: "#e8e1dd", fontFamily: "Libre Caslon Text, serif" }}
          >
            Profil & Pengaturan
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar + Identity */}
          <div
            className="rounded-2xl p-5 flex items-center gap-5"
            style={{
              background: "#1a1814",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="relative cursor-pointer shrink-0" onClick={() => fileRef.current?.click()}>
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ background: "#100f0d", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                    unoptimized={avatarPreview.startsWith("blob:")}
                  />
                ) : (
                  <span
                    className="text-lg"
                    style={{ fontFamily: "Libre Caslon Text, serif", color: "#F5C451" }}
                  >
                    {initials}
                  </span>
                )}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#F5C451", border: "2px solid #111009" }}
              >
                <Camera className="w-2.5 h-2.5" style={{ color: "#3f2e00" }} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#e8e1dd" }}>
                {profile?.full_name ?? "Pengguna"}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "#6b6356" }}>
                {userEmail}
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-[11px] mt-2 transition-opacity hover:opacity-70"
                style={{ color: "#F5C451" }}
              >
                Ganti foto
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Form fields */}
          <div
            className="rounded-2xl p-5 space-y-5"
            style={{
              background: "#1a1814",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="full_name"
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "#6b6356" }}
              >
                <User className="w-3 h-3" />
                Nama Lengkap
              </label>
              <input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                placeholder="Nama lengkap kamu"
                className="w-full text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#e8e1dd",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(245,196,81,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
              />
            </div>

            {/* Email (readonly) */}
            <div className="space-y-2">
              <label
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "#6b6356" }}
              >
                <Mail className="w-3 h-3" />
                Email
              </label>
              <div
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span className="flex-1 truncate" style={{ color: "#6b6356" }}>
                  {userEmail}
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: "rgba(245,196,81,0.1)",
                    color: "#F5C451",
                    border: "1px solid rgba(245,196,81,0.18)",
                  }}
                >
                  Google
                </span>
              </div>
            </div>

            {/* WhatsApp number */}
            <div className="space-y-2">
              <label
                htmlFor="whatsapp_number"
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "#6b6356" }}
              >
                <MessageCircle className="w-3 h-3" />
                Nomor WhatsApp Toko
              </label>
              <input
                id="whatsapp_number"
                name="whatsapp_number"
                type="tel"
                inputMode="numeric"
                defaultValue={profile?.whatsapp_number ?? ""}
                placeholder="contoh: 6281234567890"
                className="w-full text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#e8e1dd",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(37,211,102,0.45)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
              />
              <p className="text-[11px]" style={{ color: "#4e4635" }}>
                Gunakan kode negara tanpa tanda + atau 0 di depan. Pembeli akan menghubungimu lewat nomor ini.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label
                htmlFor="bio"
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "#6b6356" }}
              >
                <FileText className="w-3 h-3" />
                Bio
                <span className="font-normal normal-case tracking-normal ml-1" style={{ color: "#4e4635" }}>
                  opsional
                </span>
              </label>
              <textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio ?? ""}
                placeholder="Ceritakan tokomu dalam beberapa kalimat..."
                rows={3}
                className="w-full text-sm rounded-xl px-3.5 py-2.5 outline-none resize-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#e8e1dd",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(245,196,81,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{ background: "#F5C451", color: "#3f2e00" }}
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>

        {/* Account meta */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: "#4e4635" }}>
            Info Akun
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] mb-1" style={{ color: "#4e4635" }}>
                Member sejak
              </p>
              <p className="text-sm" style={{ color: "#9b8f7c" }}>
                {profile?.created_at
                  ? new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(profile.created_at))
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] mb-1" style={{ color: "#4e4635" }}>
                Login dengan
              </p>
              <p className="text-sm" style={{ color: "#9b8f7c" }}>
                Google OAuth
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}