"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X, Package } from "lucide-react"
import { PublicProduct } from "@/actions/public-product"
import { ProductDetailModal } from "@/components/products/product-detail-modal"
import { BottomNav } from "@/components/layout/bottom-nav"
import { formatPrice } from "@/lib/utils"
import { Profile } from "@/types"
import { CartProvider } from "@/context/cart-context"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { CartItem } from "@/types"

// ── Product Card (shop-facing) ─────────────────────────────────────────────

function ProductCard({
  product,
  onClick,
}: {
  product: PublicProduct
  onClick: () => void
}) {
  return (
    <div
      className="group text-left w-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex flex-col"
      style={{
        background: "#FDF3EC",
        border: "1px solid #D5C3B0",
        boxShadow: "0 2px 8px rgba(107,78,42,0.06)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(107,78,42,0.5)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D5C3B0")}
    >
      {/* Clickable image area */}
      <button
        onClick={onClick}
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "4/5", background: "#F3E0CC" }}
        aria-label={`Lihat detail ${product.name}`}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8" style={{ color: "#D5C3B0" }} />
          </div>
        )}
        {/* Out of stock overlay */}
        {product.stock !== null && product.stock !== undefined && product.stock === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(255,248,243,0.75)", backdropFilter: "blur(2px)" }}
          >
            <span
              className="text-[11px] font-bold px-3 py-1 rounded-full"
              style={{ background: "rgba(186,26,26,0.9)", color: "#FFFFFF" }}
            >
              Stok Habis
            </span>
          </div>
        )}
      </button>

      {/* Info + CTA */}
      <div className="px-3.5 py-3.5 flex flex-col gap-2.5 flex-1">
        <button onClick={onClick} className="text-left flex-1">
          <p
            className="text-[10px] font-semibold tracking-widest uppercase mb-1.5"
            style={{ color: "#D5C3B0", fontFamily: "Hanken Grotesk, sans-serif" }}
          >
            UMKM Lokal
          </p>
          <p
            className="text-sm leading-snug truncate mb-1"
            style={{ color: "#201A14", fontFamily: "Hanken Grotesk, sans-serif", fontWeight: 500 }}
          >
            {product.name}
          </p>
          <p
            className="text-sm"
            style={{ color: "#6B4E2A", fontFamily: "Hanken Grotesk, sans-serif", fontWeight: 600 }}
          >
            {formatPrice(product.price)}
          </p>
        </button>

        {/* Add to Cart button */}
        <AddToCartButton product={product} className="w-full" />
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

type SortOption = "newest" | "price_asc" | "price_desc"

interface ShopClientProps {
  initialProducts: PublicProduct[]
  profile: Profile | null
  initialCartItems?: CartItem[]
}

function ShopInner({ initialProducts, profile }: Omit<ShopClientProps, "initialCartItems">) {
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
    <div
      className="min-h-screen"
      style={{ background: "#FFF8F3", fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #F3E0CC 0%, #FFF8F3 100%)",
          borderBottom: "1px solid #D5C3B0",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-10 pt-10 pb-8">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: "#6B4E2A" }}
            >
              Koleksi Pilihan
            </p>
            <h1
              className="text-3xl md:text-4xl mb-2"
              style={{
                color: "#201A14",
                fontFamily: "Libre Caslon Text, serif",
                fontWeight: 400,
                letterSpacing: "-0.02em",
              }}
            >
              Toko Busari
            </h1>
            <p className="text-sm" style={{ color: "#867462" }}>
              {initialProducts.length} produk dari pengrajin lokal
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: "rgba(255,248,243,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #D5C3B0",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#867462" }}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm outline-none rounded-xl transition-all"
              style={{
                background: "#FDF3EC",
                border: "1px solid #D5C3B0",
                color: "#201A14",
                fontFamily: "Hanken Grotesk, sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6B4E2A"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#D5C3B0"
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" style={{ color: "#867462" }} />
              </button>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: showSort ? "rgba(107,78,42,0.08)" : "#FDF3EC",
                border: `1px solid ${showSort ? "#6B4E2A" : "#D5C3B0"}`,
                color: showSort ? "#6B4E2A" : "#867462",
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{sortLabels[sort]}</span>
            </button>
            {showSort && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden z-30"
                style={{
                  background: "#FFF8F3",
                  border: "1px solid #D5C3B0",
                  boxShadow: "0 16px 40px rgba(107,78,42,0.12)",
                }}
              >
                {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSort(key as SortOption)
                      setShowSort(false)
                    }}
                    className="w-full text-left px-4 py-3 text-sm transition-colors"
                    style={{
                      color: sort === key ? "#6B4E2A" : "#52432F",
                      background: sort === key ? "rgba(107,78,42,0.06)" : "transparent",
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
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(107,78,42,0.06)" }}
            >
              <Package className="w-8 h-8" style={{ color: "#D5C3B0" }} />
            </div>
            <p
              style={{
                color: "#201A14",
                fontFamily: "Libre Caslon Text, serif",
                fontSize: "18px",
              }}
            >
              {search ? `Tidak ada produk untuk "${search}"` : "Belum ada produk"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-sm"
                style={{ color: "#6B4E2A" }}
              >
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            {search && (
              <p className="text-xs mb-4" style={{ color: "#867462" }}>
                {filtered.length} hasil untuk &ldquo;{search}&rdquo;
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelected(product)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
      <BottomNav profile={profile} />
    </div>
  )
}

export function ShopClient({ initialProducts, profile, initialCartItems = [] }: ShopClientProps) {
  return (
    <CartProvider initialItems={initialCartItems}>
      <ShopInner initialProducts={initialProducts} profile={profile} />
    </CartProvider>
  )
}
