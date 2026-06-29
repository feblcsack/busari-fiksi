"use client"

import { useState, useRef, useTransition } from "react"
import Image from "next/image"
import { Profile } from "@/types"
import { updateProfile } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { showToast } from "@/components/ui/toast"
import { Camera, Loader2, User, Mail, FileText } from "lucide-react"

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-[#e8e1dd]">
      {/* Avatar Card */}
      <div className="bg-[#2A2621] rounded-[16px] border border-white/10 shadow-sm p-6 flex flex-col items-center text-center">
        <div
          className="relative cursor-pointer group mb-4"
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-24 h-24 rounded-[16px] overflow-hidden bg-[#151311] flex items-center justify-center border border-[#4e4635] shadow-md">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar"
                width={96}
                height={96}
                className="object-cover w-full h-full"
                unoptimized={avatarPreview.startsWith("blob:")}
              />
            ) : (
              <span className="text-2xl font-serif text-[#F5C451]">{initials}</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#F5C451] border-2 border-[#2A2621] flex items-center justify-center group-hover:bg-[#ffe4af] transition-colors shadow-sm">
            <Camera className="w-3.5 h-3.5 text-[#12100E]" />
          </div>
        </div>

        <p className="font-semibold text-[#e8e1dd] text-sm">
          {profile?.full_name ?? "Pengguna"}
        </p>
        <p className="text-[#d2c5b0] text-xs mt-0.5">{userEmail}</p>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-4 text-xs text-[#F5C451] font-medium hover:text-[#ffe4af] hover:underline transition-colors"
        >
          Ganti foto profil
        </button>
        <p className="text-xs text-[#9b8f7c] mt-1">PNG, JPG · Maks. 5MB</p>
      </div>

      {/* Edit Form */}
      <div className="lg:col-span-2 bg-[#2A2621] rounded-[16px] border border-white/10 shadow-sm p-6">
        <h2 className="font-serif text-2xl text-[#e8e1dd] mb-6">Informasi Akun</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Hidden avatar input */}
          <input
            ref={fileRef}
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          {/* Full Name */}
          <div>
            <Label htmlFor="full_name" className="text-xs font-semibold text-[#d2c5b0] mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <User className="w-3.5 h-3.5 text-[#9b8f7c]" />
              Nama Lengkap
            </Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              placeholder="Masukkan nama lengkap"
              className="rounded-[8px] bg-[#151311] border-[#4e4635] text-[#e8e1dd] text-sm focus-visible:ring-[#F5C451] focus-visible:border-[#F5C451] placeholder:text-[#9b8f7c]"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <Label className="text-xs font-semibold text-[#d2c5b0] mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <Mail className="w-3.5 h-3.5 text-[#9b8f7c]" />
              Email
            </Label>
            <div className="flex items-center px-3.5 py-2.5 bg-[#151311] border border-[#4e4635] rounded-[8px] text-sm text-[#d2c5b0] gap-2">
              <span className="flex-1 truncate">{userEmail}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5C451] text-[#12100E] px-2 py-0.5 rounded-full shrink-0">
                Via Google
              </span>
            </div>
            <p className="text-xs text-[#9b8f7c] mt-1.5">
              Email tidak bisa diubah karena terhubung dengan Google
            </p>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-xs font-semibold text-[#d2c5b0] mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5 text-[#9b8f7c]" />
              Bio <span className="text-[#9b8f7c] font-normal lowercase tracking-normal">(opsional)</span>
            </Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio ?? ""}
              placeholder="Ceritakan sedikit tentang dirimu atau tokomu..."
              rows={4}
              className="rounded-[8px] bg-[#151311] border-[#4e4635] text-[#e8e1dd] text-sm resize-none focus-visible:ring-[#F5C451] focus-visible:border-[#F5C451] placeholder:text-[#9b8f7c]"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#F5C451] hover:bg-[#ffe4af] text-[#12100E] rounded-[8px] gap-2 px-6 font-semibold"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin text-[#12100E]" />}
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="lg:col-span-3 bg-[#2A2621]/50 rounded-[16px] border border-white/10 p-5 backdrop-blur-sm">
        <h3 className="text-xs font-semibold text-[#9b8f7c] uppercase tracking-wider mb-4">
          Info Akun
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#151311] border border-[#4e4635] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#F5C451]" />
            </div>
            <div>
              <p className="text-xs text-[#9b8f7c]">Member sejak</p>
              <p className="font-medium text-[#e8e1dd]">
                {profile?.created_at
                  ? new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(profile.created_at))
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#151311] border border-[#4e4635] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-[#F5C451]" />
            </div>
            <div>
              <p className="text-xs text-[#9b8f7c]">Provider</p>
              <p className="font-medium text-[#e8e1dd]">Google OAuth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}