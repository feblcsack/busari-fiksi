"use client"

import { useState } from "react"
import { MapPin, Package, ShoppingBag, MessageCircle, Store } from "lucide-react"
import { Profile, Product } from "@/types"
import { formatPrice } from "@/lib/utils"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { ProductDetailModal } from "@/components/products/product-detail-modal"
import { PublicProduct } from "@/actions/public-product"

interface SellerProfileClientProps {
  seller: Profile
  products: Product[]
}

export function SellerProfileClient({ seller, products }: SellerProfileClientProps) {
  const [selected, setSelected] = useState<PublicProduct | null>(null)

  const initials = seller.full_name
    ? seller.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  // Cast products to PublicProduct for the modal
  const toPublicProduct = (p: Product): PublicProduct => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image_url: p.image_url,
    stock: p.stock,
    status: p.status,
    created_at: p.created_at,
    user_id: p.user_id,
    seller_name: seller.full_name,
  })

  return (
    <div style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
      {/* ── Hero banner ── */}
      <div style={{ background: "linear-gradient(to bottom, #F3E0CC 0%, #FFF8F3 100%)", borderBottom: "1px solid #D5C3B0" }}>
        <div className="max-w-5xl mx-auto px-5 md:px-10 pt-10 pb-8">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {seller.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.avatar_url}
                  alt={seller.full_name ?? "Seller"}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover"
                  style={{ border: "3px solid #FFFFFF", boxShadow: "0 4px 16px rgba(107,78,42,0.15)" }}
                />
              ) : (
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{ background: "#6B4E2A", color: "#FFFFFF", border: "3px solid #FFFFFF", boxShadow: "0 4px 16px rgba(107,78,42,0.15)" }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-normal"
                  style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
                  {seller.full_name ?? "Seller"}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(107,78,42,0.1)", color: "#6B4E2A" }}>
                  <Store className="w-2.5 h-2.5" strokeWidth={2} />
                  UMKM Lokal
                </span>
              </div>

              {seller.bio && (
                <p className="text-sm leading-relaxed mb-3 max-w-lg" style={{ color: "#52432F" }}>
                  {seller.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5" style={{ color: "#867462" }}>
                  <Package className="w-4 h-4" strokeWidth={1.5} />
                  <span>{products.length} produk aktif</span>
                </div>
                {seller.whatsapp_number && (
                  <a
                    href={`https://wa.me/${seller.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                    style={{ color: "#25D366" }}
                  >
                    <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                    <span>Hubungi via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Products grid ── */}
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "#6B4E2A" }}>
              Koleksi Produk
            </p>
            <h2 className="text-xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              Semua Produk dari {seller.full_name?.split(" ")[0] ?? "Seller"}
            </h2>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
            style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(107,78,42,0.06)" }}>
              <ShoppingBag className="w-8 h-8" style={{ color: "#D5C3B0" }} strokeWidth={1.2} />
            </div>
            <p className="text-lg font-normal mb-1" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              Belum ada produk aktif
            </p>
            <p className="text-sm" style={{ color: "#867462" }}>
              Produk dari seller ini sedang dalam review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const pub = toPublicProduct(product)
              const hasStock = product.stock === null || product.stock === undefined || product.stock > 0

              return (
                <div
                  key={product.id}
                  className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", boxShadow: "0 2px 8px rgba(107,78,42,0.06)" }}
                >
                  <button
                    onClick={() => setSelected(pub)}
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: "4/5", background: "#F3E0CC" }}
                    aria-label={`Lihat detail ${product.name}`}
                  >
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8" style={{ color: "#D5C3B0" }} />
                      </div>
                    )}
                    {!hasStock && (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "rgba(255,248,243,0.75)", backdropFilter: "blur(2px)" }}>
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full"
                          style={{ background: "rgba(186,26,26,0.9)", color: "#FFFFFF" }}>
                          Stok Habis
                        </span>
                      </div>
                    )}
                    {product.stock !== null && product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(186,26,26,0.85)", color: "#FFFFFF" }}>
                          Sisa {product.stock}
                        </span>
                      </div>
                    )}
                  </button>

                  <div className="px-3.5 py-3.5 flex flex-col gap-2 flex-1">
                    <button onClick={() => setSelected(pub)} className="text-left flex-1">
                      <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#D5C3B0" }}>
                        UMKM Lokal
                      </p>
                      <p className="text-sm leading-snug truncate mb-1 font-medium" style={{ color: "#201A14" }}>
                        {product.name}
                      </p>
                      <p className="text-sm font-semibold" style={{ color: "#6B4E2A" }}>
                        {formatPrice(product.price)}
                      </p>
                    </button>
                    <AddToCartButton product={pub} className="w-full" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
