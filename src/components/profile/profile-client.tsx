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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (userEmail?.[0] ?? "U").toUpperCase()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast("Ukuran foto maksimal 5MB", "error"); return }
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

  const inputStyle: React.CSSProperties = {
    background: "#FDF3EC",
    border: "1px solid #D5C3B0",
    color: "#201A14",
  }

  return (
    <div className="min-h-screen py-10 px-4 md:px-8" style={{ background: "#FFF8F3", fontFamily: "Hanken Grotesk, sans-serif" }}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="mb-8">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "#6B4E2A" }}>Akun</p>
          <h1 className="text-2xl font-normal" style={{ color: "#201A14", fontFamily: "Libre Caslon Text, serif" }}>Profil & Pengaturan</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar + Identity */}
          <div className="rounded-2xl p-5 flex items-center gap-5"
            style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="relative cursor-pointer shrink-0" onClick={() => fileRef.current?.click()}>
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
                style={{ background: "#F3E0CC", border: "1px solid #D5C3B0" }}>
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar" width={64} height={64}
                    className="object-cover w-full h-full" unoptimized={avatarPreview.startsWith("blob:")} />
                ) : (
                  <span className="text-lg" style={{ fontFamily: "Libre Caslon Text, serif", color: "#6B4E2A" }}>{initials}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#6B4E2A", border: "2px solid #FFF8F3" }}>
                <Camera className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>{profile?.full_name ?? "Pengguna"}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "#867462" }}>{userEmail}</p>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="text-[11px] mt-2 transition-opacity hover:opacity-70" style={{ color: "#6B4E2A" }}>
                Ganti foto
              </button>
            </div>
            <input ref={fileRef} type="file" name="avatar" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>

          {/* Form fields */}
          <div className="rounded-2xl p-5 space-y-5" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="space-y-2">
              <label htmlFor="full_name" className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>
                <User className="w-3 h-3" /> Nama Lengkap
              </label>
              <input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} placeholder="Nama lengkap kamu"
                className="w-full text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#6B4E2A"; e.target.style.boxShadow = "0 0 0 2px rgba(107,78,42,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D5C3B0"; e.target.style.boxShadow = "none"; }} />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>
                <Mail className="w-3 h-3" /> Email
              </label>
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(107,78,42,0.04)", border: "1px solid #D5C3B0" }}>
                <span className="flex-1 truncate" style={{ color: "#867462" }}>{userEmail}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: "rgba(107,78,42,0.1)", color: "#6B4E2A", border: "1px solid rgba(107,78,42,0.18)" }}>
                  Google
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="whatsapp_number" className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>
                <MessageCircle className="w-3 h-3" /> Nomor WhatsApp Toko
              </label>
              <input id="whatsapp_number" name="whatsapp_number" type="tel" inputMode="numeric"
                defaultValue={profile?.whatsapp_number ?? ""} placeholder="contoh: 6281234567890"
                className="w-full text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#6B4E2A"; e.target.style.boxShadow = "0 0 0 2px rgba(107,78,42,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D5C3B0"; e.target.style.boxShadow = "none"; }} />
              <p className="text-[11px]" style={{ color: "#D5C3B0" }}>
                Gunakan kode negara tanpa tanda + atau 0 di depan.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>
                <FileText className="w-3 h-3" /> Bio
                <span className="font-normal normal-case tracking-normal ml-1" style={{ color: "#D5C3B0" }}>opsional</span>
              </label>
              <textarea id="bio" name="bio" defaultValue={profile?.bio ?? ""}
                placeholder="Ceritakan tokomu dalam beberapa kalimat..." rows={3}
                className="w-full text-sm rounded-xl px-3.5 py-2.5 outline-none resize-none transition-all" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#6B4E2A"; e.target.style.boxShadow = "0 0 0 2px rgba(107,78,42,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D5C3B0"; e.target.style.boxShadow = "none"; }} />
            </div>

            <button type="submit" disabled={isPending}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
              style={{ background: "#6B4E2A", color: "#FFFFFF" }}>
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl p-5" style={{ background: "rgba(107,78,42,0.04)", border: "1px solid #D5C3B0" }}>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: "#D5C3B0" }}>Info Akun</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] mb-1" style={{ color: "#D5C3B0" }}>Member sejak</p>
              <p className="text-sm" style={{ color: "#867462" }}>
                {profile?.created_at
                  ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(profile.created_at))
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] mb-1" style={{ color: "#D5C3B0" }}>Login dengan</p>
              <p className="text-sm" style={{ color: "#867462" }}>Google OAuth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
