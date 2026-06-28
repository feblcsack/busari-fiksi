"use client"

import { useState, useRef, useTransition } from "react"
import { Product } from "@/types"
import { createProduct, updateProduct } from "@/actions/products"
import { showToast } from "@/components/ui/toast"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ProductFormModalProps {
  open: boolean
  onClose: () => void
  mode: "create" | "edit"
  product?: Product
}

export function ProductFormModal({ open, onClose, mode, product }: ProductFormModalProps) {
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null)
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const validate = (fd: FormData) => {
    const errs: Record<string, string> = {}
    const name = (fd.get("name") as string)?.trim()
    const price = fd.get("price") as string
    if (!name) errs.name = "Nama produk wajib diisi"
    if (!price || isNaN(Number(price)) || Number(price) < 0)
      errs.price = "Harga harus berupa angka yang valid"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (!validate(fd)) return
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProduct(fd)
          showToast("Produk berhasil ditambahkan", "success")
        } else if (product) {
          await updateProduct(product.id, fd)
          showToast("Produk berhasil diperbarui", "success")
        }
        handleClose()
      } catch {
        showToast("Terjadi kesalahan, coba lagi", "error")
      }
    })
  }

  const handleClose = () => {
    setPreview(product?.image_url ?? null)
    setErrors({})
    formRef.current?.reset()
    onClose()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran gambar maksimal 5MB", "error")
      return
    }
    setPreview(URL.createObjectURL(file))
  }

  if (!open) return null

  const inputBase: React.CSSProperties = {
    backgroundColor: "#151311",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#e8e1dd",
    fontFamily: "Hanken Grotesk, sans-serif",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80]"
        style={{ background: "rgba(10, 8, 6, 0.85)", backdropFilter: "blur(8px)" }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[90] flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div
          className="w-full md:max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#1d1b19",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Handle (mobile) */}
          <div className="flex justify-center pt-3 md:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          </div>

          {/* Header */}
          <div
            className="flex items-center justify-between px-6 pt-5 pb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "#F5C451" }}
              >
                {mode === "create" ? "Produk Baru" : "Edit Produk"}
              </p>
              <h2
                className="text-lg font-normal mt-0.5"
                style={{ fontFamily: "Libre Caslon Text, serif", color: "#e8e1dd" }}
              >
                {mode === "create" ? "Tambah ke Koleksi" : "Perbarui Detail"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <X className="w-4 h-4" style={{ color: "#9b8f7c" }} />
            </button>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Image Upload */}
            <div>
              <label
                className="block text-[11px] font-semibold tracking-widest uppercase mb-2"
                style={{ color: "#9b8f7c" }}
              >
                Foto Produk
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative group cursor-pointer rounded-xl overflow-hidden transition-all"
                style={{
                  border: preview ? "none" : "2px dashed rgba(78, 70, 53, 0.6)",
                  background: preview ? "transparent" : "rgba(255,255,255,0.02)",
                }}
              >
                {preview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden" style={{ backgroundColor: "#151311" }}>
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized={preview.startsWith("blob:")}
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                      style={{ background: "rgba(21,19,17,0.6)" }}
                    >
                      <Upload className="w-4 h-4" style={{ color: "#F5C451" }} />
                      <span className="text-xs font-semibold" style={{ color: "#F5C451" }}>
                        Ganti Foto
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreview(null)
                        if (fileRef.current) fileRef.current.value = ""
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: "rgba(245,196,81,0.08)" }}
                    >
                      <ImageIcon className="w-5 h-5" style={{ color: "#F5C451" }} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#d2c5b0" }}>
                      Klik untuk upload foto
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#4e4635" }}>
                      PNG, JPG, WEBP · Maks. 5MB
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#9b8f7c" }}>
                Nama Produk <span style={{ color: "#ffb4ab" }}>*</span>
              </label>
              <input
                name="name"
                defaultValue={product?.name ?? ""}
                placeholder="Contoh: Batik Tulis Premium"
                style={inputBase}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(245,196,81,0.5)"
                  e.target.style.boxShadow = "0 0 0 1px rgba(245,196,81,0.12)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)"
                  e.target.style.boxShadow = "none"
                }}
              />
              {errors.name && (
                <p className="text-xs mt-1.5" style={{ color: "#ffb4ab" }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#9b8f7c" }}>
                Deskripsi{" "}
                <span className="normal-case tracking-normal font-normal" style={{ color: "#4e4635" }}>
                  (opsional)
                </span>
              </label>
              <textarea
                name="description"
                defaultValue={product?.description ?? ""}
                placeholder="Ceritakan keunikan dan bahan produkmu..."
                rows={3}
                style={{ ...inputBase, resize: "none" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(245,196,81,0.5)"
                  e.target.style.boxShadow = "0 0 0 1px rgba(245,196,81,0.12)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#9b8f7c" }}>
                Harga (IDR) <span style={{ color: "#ffb4ab" }}>*</span>
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold"
                  style={{ color: "#4e4635" }}
                >
                  Rp
                </span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={product?.price ?? ""}
                  placeholder="0"
                  style={{ ...inputBase, paddingLeft: "42px" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(245,196,81,0.5)"
                    e.target.style.boxShadow = "0 0 0 1px rgba(245,196,81,0.12)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>
              {errors.price && (
                <p className="text-xs mt-1.5" style={{ color: "#ffb4ab" }}>
                  {errors.price}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1 pb-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all hover:bg-white/5 disabled:opacity-40"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#9b8f7c",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: "#F5C451", color: "#3f2e00" }}
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending
                  ? mode === "create"
                    ? "Menyimpan..."
                    : "Memperbarui..."
                  : mode === "create"
                  ? "Simpan Produk"
                  : "Perbarui Produk"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}