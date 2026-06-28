"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  ShoppingBag, 
  Shirt, 
  Sparkles, 
  User, 
  Search, 
  SlidersHorizontal, 
  X, 
  Package, 
  PlusCircleIcon
} from "lucide-react"
import { PublicProduct, getPublicProducts } from "../../actions/public-product"
import { ProductDetailModal } from "@/components/products/product-detail-modal"
import { formatPrice, cn } from "@/lib/utils"

// --- BOTTOM NAV COMPONENT ---
const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/dashboard", label: "Add", icon: PlusCircleIcon },
  { href: "/try-on", label: "Try On", icon: Sparkles },
  { href: "/dashboard", label: "Account", icon: User },
]

function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile: fixed bottom full-width bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div
          className="flex items-center justify-around px-2 py-2 mx-3 mb-3 rounded-2xl"
          style={{
            background: "rgba(34, 31, 29, 0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(240, 192, 77, 0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(240,192,77,0.1)",
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-[#F5C451]"
                    : "text-[#9b8f7c] hover:text-[#e8e1dd]"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive && "drop-shadow-[0_0_6px_rgba(245,196,81,0.6)]"
                    )}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F5C451]" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none tracking-wide transition-all duration-200",
                    isActive ? "opacity-100" : "opacity-60"
                  )}
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop: floating pill at bottom center */}
      <nav className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div
          className="flex items-center gap-1 px-3 py-2 rounded-full"
          style={{
            background: "rgba(28, 25, 23, 0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(240, 192, 77, 0.2)",
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(240,192,77,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm",
                  isActive
                    ? "bg-[#F5C451] text-[#3f2e00] font-semibold"
                    : "text-[#9b8f7c] hover:text-[#e8e1dd] hover:bg-white/5"
                )}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer so content doesn't hide behind bottom nav */}
      <div className="h-24 md:h-20" />
    </>
  )
}

// --- PRODUCT CARD COMPONENT ---
function ProductCard({
  product,
  onClick,
}: {
  product: PublicProduct
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.99]"
      style={{
        background: "#221f1d",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      {/* Image */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "3/4", background: "#151311" }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10" style={{ color: "#4e4635" }} />
          </div>
        )}
        {/* Subtle gradient */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(21,19,17,0.6) 0%, transparent 50%)",
          }}
        />
        {/* UMKM badge */}
        <div
          className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase"
          style={{
            background: "#F5C451",
            color: "#3f2e00",
            fontFamily: "Hanken Grotesk, sans-serif",
          }}
        >
          UMKM
        </div>
      </div>

      {/* Info */}
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
            style={{ color: "#9b8f7c", fontFamily: "Hanken Grotesk, sans-serif" }}
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

// --- MAIN PAGE COMPONENT ---
type SortOption = "newest" | "price_asc" | "price_desc"

export default function ShopPage() {
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("newest")
  const [showSort, setShowSort] = useState(false)
  const [selected, setSelected] = useState<PublicProduct | null>(null)

  useEffect(() => {
    getPublicProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  const filtered = products
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
      style={{ background: "#151311", fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      {/* Hero header */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(245,196,81,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(78, 70, 53, 0.3)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-10 pt-10 pb-8">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "#F5C451" }}
          >
            Koleksi Pilihan
          </p>
          <h1
            className="text-3xl md:text-4xl mb-2"
            style={{
              color: "#e8e1dd",
              fontFamily: "Libre Caslon Text, serif",
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            Toko Busari
          </h1>
          <p className="text-sm" style={{ color: "#9b8f7c" }}>
            {loading ? "Memuat produk..." : `${products.length} produk dari pengrajin lokal`}
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
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#9b8f7c" }}
            />
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
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(245, 196, 81, 0.5)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(78, 70, 53, 0.5)"
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" style={{ color: "#9b8f7c" }} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
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
                    onClick={() => {
                      setSort(key as SortOption)
                      setShowSort(false)
                    }}
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
        {loading ? (
          // Skeleton
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: "#221f1d", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div style={{ aspectRatio: "3/4", background: "#2c2927" }} />
                <div className="p-3.5 space-y-2">
                  <div className="h-3 w-3/4 rounded" style={{ background: "#2c2927" }} />
                  <div className="h-3 w-1/2 rounded" style={{ background: "#2c2927" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Package className="w-8 h-8" style={{ color: "#4e4635" }} />
            </div>
            <p style={{ color: "#e8e1dd", fontFamily: "Libre Caslon Text, serif", fontSize: "18px" }}>
              {search ? `Tidak ada produk untuk "${search}"` : "Belum ada produk"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-sm"
                style={{ color: "#F5C451" }}
              >
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

      {/* Product Detail Modal */}
      <ProductDetailModal product={selected} onClose={() => setSelected(null)} />

      {/* BOTTOM NAV BAR DITARUH DI SINI */}
      <BottomNav />
    </div>
  )
}