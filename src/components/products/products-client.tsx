"use client";

import { useState } from "react";
import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { ProductFormModal } from "./product-form-modal";
import { Plus, Package, Search, LayoutGrid, List, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductsClientProps {
  initialProducts: Product[];
}

export function ProductsClient({
  initialProducts: products,
}: ProductsClientProps) {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");

  const filtered = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const inputStyle = {
    backgroundColor: "#1d1b19",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e8e1dd",
    fontFamily: "Hanken Grotesk, sans-serif",
  };

  return (
    <div
      className="min-h-screen pb-28"
      style={{ backgroundColor: "#151311", fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <p
              className="text-[11px] font-semibold tracking-widest uppercase mb-2"
              style={{ color: "#F5C451" }}
            >
              Manajemen Produk
            </p>
            <h1
              className="text-3xl md:text-4xl font-normal"
              style={{
                fontFamily: "Libre Caslon Text, serif",
                color: "#e8e1dd",
                letterSpacing: "-0.02em",
              }}
            >
              Koleksi Produk
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "#9b8f7c" }}>
              {products.length} produk tersimpan di butikmu.
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all hover:brightness-110 active:scale-[0.97] self-start sm:self-auto"
            style={{ backgroundColor: "#F5C451", color: "#3f2e00" }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Tambah Produk
          </button>
        </div>

        {/* Toolbar */}
        {products.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#9b8f7c" }}
                strokeWidth={1.8}
              />
              <input
                type="text"
                placeholder="Cari koleksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-sm rounded-xl outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(245,196,81,0.4)";
                  e.target.style.boxShadow = "0 0 0 1px rgba(245,196,81,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
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

            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2.5 text-sm rounded-xl outline-none transition-all appearance-none cursor-pointer"
                style={{ ...inputStyle, paddingRight: "2rem" }}
              >
                <option value="newest">Terbaru</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>

              {/* View toggle */}
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#1d1b19" }}
              >
                {(["grid", "list"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="p-2.5 transition-all"
                    style={{
                      backgroundColor: view === v ? "rgba(245,196,81,0.12)" : "transparent",
                      color: view === v ? "#F5C451" : "#9b8f7c",
                    }}
                  >
                    {v === "grid" ? (
                      <LayoutGrid className="w-4 h-4" strokeWidth={1.8} />
                    ) : (
                      <List className="w-4 h-4" strokeWidth={1.8} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-28 text-center rounded-2xl"
            style={{
              backgroundColor: "#1d1b19",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <Package className="w-8 h-8" style={{ color: "#4e4635" }} strokeWidth={1.5} />
            </div>
            <h3
              className="text-xl mb-2"
              style={{ fontFamily: "Libre Caslon Text, serif", color: "#e8e1dd" }}
            >
              Belum ada koleksi
            </h3>
            <p className="text-sm max-w-xs mb-8" style={{ color: "#9b8f7c" }}>
              Mulai tambah produk pertamamu. Unggah foto terbaik dan isi detail produk.
            </p>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ backgroundColor: "#F5C451", color: "#3f2e00" }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Tambah Koleksi Pertama
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-9 h-9 mb-4" style={{ color: "#4e4635" }} strokeWidth={1.5} />
            <p className="text-sm" style={{ color: "#9b8f7c" }}>
              Tidak ada koleksi untuk{" "}
              <span style={{ color: "#e8e1dd" }}>&ldquo;{search}&rdquo;</span>
            </p>
            <button
              onClick={() => setSearch("")}
              className="text-sm mt-3 hover:underline"
              style={{ color: "#F5C451" }}
            >
              Hapus pencarian
            </button>
          </div>
        ) : view === "grid" ? (
          <>
            {search && (
              <p className="text-xs mb-4" style={{ color: "#9b8f7c" }}>
                {filtered.length} hasil untuk &ldquo;{search}&rdquo;
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={(p) => setEditProduct(p)}
                />
              ))}
            </div>
          </>
        ) : (
          /* List view */
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#1d1b19" }}
          >
            {filtered.map((product, idx) => (
              <div
                key={product.id}
                className="flex items-center gap-4 px-5 py-4 transition-colors group hover:bg-white/[0.025] cursor-pointer"
                style={{
                  borderBottom:
                    idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
                onClick={() => setEditProduct(product)}
              >
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: "#2c2927" }}
                >
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5" style={{ color: "#4e4635" }} strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#e8e1dd" }}>
                    {product.name}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#9b8f7c" }}>
                    {product.description ?? "Tanpa deskripsi"}
                  </p>
                </div>
                {/* Price bar */}
                <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 w-32">
                  <span className="text-sm font-semibold" style={{ color: "#F5C451" }}>
                    {formatPrice(product.price)}
                  </span>
                  <div
                    className="w-full h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(product.price / Math.max(...products.map((p) => p.price))) * 100}%`,
                        background: "linear-gradient(to right, #4e4635, #F5C451)",
                      }}
                    />
                  </div>
                </div>
                <button
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-2"
                  style={{
                    background: "rgba(245,196,81,0.1)",
                    color: "#F5C451",
                    border: "1px solid rgba(245,196,81,0.2)",
                  }}
                  onClick={(e) => { e.stopPropagation(); setEditProduct(product); }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <ProductFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        mode="create"
      />

      {/* Edit Modal */}
      {editProduct && (
        <ProductFormModal
          open={true}
          onClose={() => setEditProduct(null)}
          mode="edit"
          product={editProduct}
        />
      )}
    </div>
  );
}