"use client"

import { useState, useRef, useTransition } from "react"
import { Product, Profile } from "@/types"
import { adminCreateProduct, adminUpdateProduct } from "@/actions/admin"
import { showToast } from "@/components/ui/toast"
import { X, Loader2, ImageIcon, Upload } from "lucide-react"
import Image from "next/image"

type ExtProduct = Product & { seller_name?: string | null; seller_email?: string | null }

interface AdminProductFormModalProps {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  product?: ExtProduct
  users: Profile[]
}

export function AdminProductFormModal({ open, onClose, mode, product, users }: AdminProductFormModalProps) {
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (mode === "create") {
          await adminCreateProduct(fd)
          showToast("Produk berhasil ditambahkan", "success")
        } else if (product) {
          await adminUpdateProduct(product.id, fd)
          showToast("Produk berhasil diperbarui", "success")
        }
        formRef.current?.reset()
        setPreview(null)
        onClose()
      } catch {
        showToast("Terjadi kesalahan", "error")
      }
    })
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast("Ukuran gambar maksimal 5MB", "error"); return }
    setPreview(URL.createObjectURL(file))
  }

  if (!open) return null

  const inputStyle: React.CSSProperties = {
    backgroundColor: "#FDF3EC",
    border: "1px solid #D5C3B0",
    color: "#201A14",
    fontFamily: "Hanken Grotesk, sans-serif",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    transition: "border-color 0.15s",
  }

  return (
    <>
      <div className="fixed inset-0 z-[80]" style={{ background: "rgba(32,26,20,0.4)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="w-full md:max-w-lg rounded-t-3xl md:rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#FFF8F3", border: "1px solid #D5C3B0", boxShadow: "0 32px 80px rgba(107,78,42,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
          <div className="flex justify-center pt-3 md:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: "#D5C3B0" }} />
          </div>
          <div className="flex items-center justify-between px-6 pt-5 pb-4 sticky top-0 z-10"
            style={{ borderBottom: "1px solid rgba(107,78,42,0.08)", background: "#FFF8F3" }}>
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#6B4E2A" }}>
                Admin — {mode === "create" ? "Produk Baru" : "Edit Produk"}
              </p>
              <h2 className="text-lg font-normal mt-0.5" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
                {mode === "create" ? "Tambah Produk" : "Perbarui Produk"}
              </h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(107,78,42,0.06)" }}>
              <X className="w-4 h-4" style={{ color: "#867462" }} />
            </button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* User selector (create only) */}
            {mode === "create" && (
              <div>
                <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#867462" }}>
                  Penjual <span style={{ color: "#BA1A1A" }}>*</span>
                </label>
                <select name="user_id" required style={{ ...inputStyle, appearance: "none" }}
                  onFocus={(e) => { e.target.style.borderColor = "#6B4E2A" }}
                  onBlur={(e) => { e.target.style.borderColor = "#D5C3B0" }}>
                  <option value="">Pilih penjual...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name ?? u.email ?? u.id}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Image */}
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#867462" }}>Foto Produk</label>
              <div onClick={() => fileRef.current?.click()}
                className="relative group cursor-pointer rounded-xl overflow-hidden"
                style={{ border: preview ? "none" : "2px dashed #D5C3B0", background: preview ? "transparent" : "rgba(107,78,42,0.03)" }}>
                {preview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden" style={{ backgroundColor: "#F3E0CC" }}>
                    <Image src={preview} alt="Preview" fill className="object-cover" unoptimized={preview.startsWith("blob:")} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                      style={{ background: "rgba(255,248,243,0.75)" }}>
                      <Upload className="w-4 h-4" style={{ color: "#6B4E2A" }} />
                      <span className="text-xs font-semibold" style={{ color: "#6B4E2A" }}>Ganti Foto</span>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); if (fileRef.current) fileRef.current.value = "" }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                      style={{ background: "rgba(32,26,20,0.4)" }}>
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: "rgba(107,78,42,0.08)" }}>
                      <ImageIcon className="w-5 h-5" style={{ color: "#6B4E2A" }} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#52432F" }}>Klik untuk upload</p>
                    <p className="text-xs mt-0.5" style={{ color: "#D5C3B0" }}>PNG, JPG, WEBP · Maks. 5MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" name="image" accept="image/*" onChange={handleFile} className="hidden" />
            </div>

            {/* Name */}
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#867462" }}>
                Nama Produk <span style={{ color: "#BA1A1A" }}>*</span>
              </label>
              <input name="name" required defaultValue={product?.name ?? ""} placeholder="Nama produk"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#6B4E2A" }}
                onBlur={(e) => { e.target.style.borderColor = "#D5C3B0" }} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#867462" }}>Deskripsi</label>
              <textarea name="description" defaultValue={product?.description ?? ""} placeholder="Deskripsi produk..." rows={3}
                style={{ ...inputStyle, resize: "none" }}
                onFocus={(e) => { e.target.style.borderColor = "#6B4E2A" }}
                onBlur={(e) => { e.target.style.borderColor = "#D5C3B0" }} />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#867462" }}>
                Harga (IDR) <span style={{ color: "#BA1A1A" }}>*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "#867462" }}>Rp</span>
                <input name="price" type="number" min="0" required defaultValue={product?.price ?? ""} placeholder="0"
                  style={{ ...inputStyle, paddingLeft: "42px" }}
                  onFocus={(e) => { e.target.style.borderColor = "#6B4E2A" }}
                  onBlur={(e) => { e.target.style.borderColor = "#D5C3B0" }} />
              </div>
            </div>

            <div className="flex gap-3 pb-1">
              <button type="button" onClick={onClose} disabled={isPending}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all hover:bg-black/5 disabled:opacity-40"
                style={{ border: "1px solid #D5C3B0", color: "#867462" }}>
                Batal
              </button>
              <button type="submit" disabled={isPending}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-95 disabled:opacity-50"
                style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? "Menyimpan..." : mode === "create" ? "Simpan" : "Perbarui"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
