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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Avatar Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
        <div
          className="relative cursor-pointer group mb-4"
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-indigo-50 flex items-center justify-center border-2 border-white shadow-md">
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
              <span className="text-2xl font-bold text-indigo-600">{initials}</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center group-hover:bg-indigo-700 transition-colors shadow-sm">
            <Camera className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <p className="font-semibold text-slate-900 text-sm">
          {profile?.full_name ?? "Pengguna"}
        </p>
        <p className="text-slate-400 text-xs mt-0.5">{userEmail}</p>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-4 text-xs text-indigo-600 font-medium hover:text-indigo-700 hover:underline transition-colors"
        >
          Ganti foto profil
        </button>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG · Maks. 5MB</p>
      </div>

      {/* Edit Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 text-sm mb-5">Informasi Akun</h2>

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
            <Label htmlFor="full_name" className="text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nama Lengkap
            </Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              placeholder="Masukkan nama lengkap"
              className="rounded-xl text-sm"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <Label className="text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email
            </Label>
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 gap-2">
              <span className="flex-1 truncate">{userEmail}</span>
              <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md shrink-0">
                Via Google
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Email tidak bisa diubah karena terhubung dengan Google
            </p>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className="text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Bio <span className="text-slate-400 font-normal">(opsional)</span>
            </Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio ?? ""}
              placeholder="Ceritakan sedikit tentang dirimu atau tokomu..."
              rows={4}
              className="rounded-xl text-sm resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 px-6"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="lg:col-span-3 bg-slate-50 rounded-2xl border border-slate-100 p-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Info Akun
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Member sejak</p>
              <p className="font-medium text-slate-700">
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
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Provider</p>
              <p className="font-medium text-slate-700">Google OAuth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
