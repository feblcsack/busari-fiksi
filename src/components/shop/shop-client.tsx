"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X, Package } from "lucide-react"
import { PublicProduct } from "@/actions/public-product"
import { ProductDetailModal } from "@/components/products/product-detail-modal"
import { BottomNav } from "@/components/layout/bottom-nav"
import { formatPrice } from "@/lib/utils"
import { Profile } from "@/types"

// --- PRODUCT CARD ---
function ProductCard({ product, onClick }: { product: PublicProduct; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99]"
      style={{
        background: "#1a1814",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Image — object-contain so the product is never cropped */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: "1/1", background: "#100f0d" }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10" style={{ color: "#332f29" }} strokeWidth={1.2} />
          </div>
        )}
        <div
          className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase"
          style={{ background: "#F5C451", color: "#3f2e00", fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          UMKM
        </div>
      </div>

      <div className="px-3.5 py-3">
        <p
          className="text-sm font-medium truncate mb-0.5"
          style={{ color: "#e8e1dd", fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          {product.name}
        </p>
        {product.description && (
          <p
            className="text-xs truncate mb-2"
            style={{ color: "#6b6356", fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            {product.description}
          </p>
        )}
        <p
          className="text-sm font-semibold"
          style={{ color: "#F5C451", fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          {formatPrice(product.price)}
        </p>
      </div>
    </button>
  )
}

// --- MAIN CLIENT COMPONENT ---
type SortOption = "newest" | "price_asc" | "price_desc"

interface ShopClientProps {
  initialProducts: PublicProduct[]
  profile: Profile | null
}

export function ShopClient({ initialProducts, profile }: ShopClientProps) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("newest")
  const [showSort, setShowSort] = useState(false)
  const [selected, setSelected] = useState<PublicProduct | null>(null)

  const filtered = initialProducts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price
      if (sort === "price_desc") return b.price - a.price
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const sortLabels: Record<SortOption, string> = {
    newest: "Terbaru",
    price_asc: "Harga: Terendah",
    price_desc: "Harga: Tertinggi",
  }

  return (
    <div className="min-h-screen" style={{ background: "#151311", fontFamily: "Hanken Grotesk, sans-serif" }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, rgba(245,196,81,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(78, 70, 53, 0.3)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-10 pt-10 pb-8">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#F5C451" }}>
            Koleksi Pilihan
          </p>
          <h1
            className="text-3xl md:text-4xl mb-2"
            style={{ color: "#e8e1dd", fontFamily: "Libre Caslon Text, serif", fontWeight: 400, letterSpacing: "-0.02em" }}
          >
            Toko Busari
          </h1>
          <p className="text-sm" style={{ color: "#9b8f7c" }}>
            {initialProducts.length} produk dari pengrajin lokal
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: "rgba(21, 19, 17, 0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(78, 70, 53, 0.25)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9b8f7c" }} />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm outline-none rounded-xl transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(78, 70, 53, 0.5)",
                color: "#e8e1dd",
                fontFamily: "Hanken Grotesk, sans-serif",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(245, 196, 81, 0.5)" }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(78, 70, 53, 0.5)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5" style={{ color: "#9b8f7c" }} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: showSort ? "rgba(245, 196, 81, 0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${showSort ? "rgba(245, 196, 81, 0.4)" : "rgba(78, 70, 53, 0.5)"}`,
                color: showSort ? "#F5C451" : "#9b8f7c",
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{sortLabels[sort]}</span>
            </button>

            {showSort && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden z-30"
                style={{
                  background: "#221f1d",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                }}
              >
                {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setSort(key as SortOption); setShowSort(false) }}
                    className="w-full text-left px-4 py-3 text-sm transition-colors"
                    style={{
                      color: sort === key ? "#F5C451" : "#d2c5b0",
                      background: sort === key ? "rgba(245, 196, 81, 0.08)" : "transparent",
                      fontFamily: "Hanken Grotesk, sans-serif",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
              <Package className="w-8 h-8" style={{ color: "#4e4635" }} />
            </div>
            <p style={{ color: "#e8e1dd", fontFamily: "Libre Caslon Text, serif", fontSize: "18px" }}>
              {search ? `Tidak ada produk untuk "${search}"` : "Belum ada produk"}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-3 text-sm" style={{ color: "#F5C451" }}>
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            {search && (
              <p className="text-xs mb-4" style={{ color: "#9b8f7c" }}>
                {filtered.length} hasil untuk &ldquo;{search}&rdquo;
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => setSelected(product)} />
              ))}
            </div>
          </>
        )}
      </div>

      <ProductDetailModal
        product={selected}
        onClose={() => setSelected(null)}
        whatsappNumber={selected?.seller_whatsapp}
      />

      {/* Profile diterusin ke BottomNav — muncul kalau user login */}
      <BottomNav profile={profile} />
    </div>
  )
}