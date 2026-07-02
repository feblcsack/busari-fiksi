"use client";

import { useState } from "react";
import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { ProductFormModal } from "./product-form-modal";
import { Plus, Package, Search, LayoutGrid, List, X, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductsClientProps {
  initialProducts: Product[];
}

// Status badge component
function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = status ?? "pending";
  const config = {
    pending: {
      label: "Menunggu Review",
      bg: "rgba(107,78,42,0.08)",
      color: "#6B4E2A",
      border: "rgba(107,78,42,0.2)",
      icon: Clock,
    },
    approved: {
      label: "Disetujui",
      bg: "rgba(92,96,41,0.08)",
      color: "#5C6029",
      border: "rgba(92,96,41,0.2)",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Ditolak",
      bg: "rgba(186,26,26,0.08)",
      color: "#BA1A1A",
      border: "rgba(186,26,26,0.2)",
      icon: XCircle,
    },
  };
  const c = config[s as keyof typeof config] ?? config.pending;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
      {c.label}
    </span>
  );
}

export function ProductsClient({ initialProducts: products }: ProductsClientProps) {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Counts per status
  const pendingProducts = products.filter((p) => (p.status ?? "pending") === "pending");
  const approvedProducts = products.filter((p) => p.status === "approved");
  const rejectedProducts = products.filter((p) => p.status === "rejected");

  const filtered = products
    .filter((p) => {
      const matchTab = activeTab === "all" || (p.status ?? "pending") === activeTab;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const inputStyle: React.CSSProperties = {
    backgroundColor: "#FDF3EC",
    border: "1px solid #D5C3B0",
    color: "#201A14",
    fontFamily: "Hanken Grotesk, sans-serif",
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#FFF8F3", fontFamily: "Hanken Grotesk, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#6B4E2A" }}>
              Manajemen Produk
            </p>
            <h1 className="text-3xl md:text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
              Koleksi Produk
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "#867462" }}>
              {products.length} produk tersimpan di butikmu.
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all hover:brightness-95 active:scale-[0.97] self-start sm:self-auto"
            style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Tambah Produk
          </button>
        </div>

        {/* ── Waiting Queue Banner (only when there are pending/rejected) ── */}
        {(pendingProducts.length > 0 || rejectedProducts.length > 0) && (
          <div className="mb-6 space-y-3">
            {/* Pending banner */}
            {pendingProducts.length > 0 && (
              <div className="flex items-start gap-4 px-5 py-4 rounded-2xl"
                style={{ background: "rgba(107,78,42,0.06)", border: "1px solid rgba(107,78,42,0.2)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(107,78,42,0.1)" }}>
                  <Clock className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#201A14" }}>
                    {pendingProducts.length} produk sedang menunggu review admin
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#867462" }}>
                    Produk akan tampil di toko setelah disetujui. Proses review biasanya memakan waktu 1×24 jam.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {pendingProducts.slice(0, 3).map((p) => (
                      <span key={p.id} className="text-[11px] px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(107,78,42,0.08)", color: "#52432F", border: "1px solid rgba(107,78,42,0.12)" }}>
                        {p.name}
                      </span>
                    ))}
                    {pendingProducts.length > 3 && (
                      <span className="text-[11px] px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(107,78,42,0.06)", color: "#867462" }}>
                        +{pendingProducts.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rejected banner */}
            {rejectedProducts.length > 0 && (
              <div className="flex items-start gap-4 px-5 py-4 rounded-2xl"
                style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.15)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(186,26,26,0.08)" }}>
                  <XCircle className="w-4 h-4" style={{ color: "#BA1A1A" }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#201A14" }}>
                    {rejectedProducts.length} produk ditolak oleh admin
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#867462" }}>
                    Lihat catatan admin, perbaiki produk, lalu simpan ulang untuk review kembali.
                  </p>
                  {/* Show review notes */}
                  {rejectedProducts.filter(p => p.review_note).slice(0, 2).map((p) => (
                    <div key={p.id} className="flex items-start gap-2 mt-2 p-2.5 rounded-xl"
                      style={{ background: "rgba(186,26,26,0.05)", border: "1px solid rgba(186,26,26,0.1)" }}>
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#BA1A1A" }} strokeWidth={1.8} />
                      <div>
                        <p className="text-[11px] font-semibold" style={{ color: "#BA1A1A" }}>{p.name}</p>
                        <p className="text-[11px]" style={{ color: "#52432F" }}>{p.review_note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Status Tabs ── */}
        {products.length > 0 && (
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            {([
              { key: "all", label: `Semua (${products.length})` },
              { key: "approved", label: `Disetujui (${approvedProducts.length})` },
              { key: "pending", label: `Pending (${pendingProducts.length})` },
              { key: "rejected", label: `Ditolak (${rejectedProducts.length})` },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className="px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
                style={{
                  backgroundColor: activeTab === key ? "#6B4E2A" : "transparent",
                  color: activeTab === key ? "#FFFFFF" : "#52432F",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Toolbar ── */}
        {products.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#867462" }} strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Cari koleksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-sm rounded-xl outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#6B4E2A"; e.target.style.boxShadow = "0 0 0 2px rgba(107,78,42,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D5C3B0"; e.target.style.boxShadow = "none"; }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5" style={{ color: "#867462" }} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
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
              <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #D5C3B0", backgroundColor: "#FDF3EC" }}>
                {(["grid", "list"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)} className="p-2.5 transition-all"
                    style={{ backgroundColor: view === v ? "rgba(107,78,42,0.12)" : "transparent", color: view === v ? "#6B4E2A" : "#867462" }}>
                    {v === "grid" ? <LayoutGrid className="w-4 h-4" strokeWidth={1.8} /> : <List className="w-4 h-4" strokeWidth={1.8} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Empty / No results ── */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center rounded-2xl"
            style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(107,78,42,0.06)" }}>
              <Package className="w-8 h-8" style={{ color: "#D5C3B0" }} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl mb-2" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              Belum ada koleksi
            </h3>
            <p className="text-sm max-w-xs mb-8" style={{ color: "#867462" }}>
              Mulai tambah produk pertamamu. Setiap produk akan direview oleh admin sebelum tampil di toko.
            </p>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:brightness-95 active:scale-[0.97]"
              style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}>
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Tambah Koleksi Pertama
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-9 h-9 mb-4" style={{ color: "#D5C3B0" }} strokeWidth={1.5} />
            <p className="text-sm" style={{ color: "#867462" }}>
              Tidak ada koleksi untuk{" "}
              <span style={{ color: "#201A14" }}>&ldquo;{search || activeTab}&rdquo;</span>
            </p>
            <button onClick={() => { setSearch(""); setActiveTab("all"); }} className="text-sm mt-3 hover:underline" style={{ color: "#6B4E2A" }}>
              Reset filter
            </button>
          </div>
        ) : view === "grid" ? (
          <>
            {(search || activeTab !== "all") && (
              <p className="text-xs mb-4" style={{ color: "#867462" }}>{filtered.length} produk</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onEdit={(p) => setEditProduct(p)} />
              ))}
            </div>
          </>
        ) : (
          /* List view — shows status prominently */
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #D5C3B0", backgroundColor: "#FDF3EC" }}>
            {filtered.map((product, idx) => (
              <div key={product.id}
                className="flex items-center gap-4 px-5 py-4 transition-colors group hover:bg-black/[0.02] cursor-pointer"
                style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(107,78,42,0.06)" : "none" }}
                onClick={() => setEditProduct(product)}>
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: "#F3E0CC" }}>
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5" style={{ color: "#D5C3B0" }} strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>{product.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "#867462" }}>{product.description ?? "Tanpa deskripsi"}</p>
                  <div className="mt-1.5">
                    <StatusBadge status={product.status} />
                  </div>
                  {product.review_note && product.status === "rejected" && (
                    <p className="text-[11px] mt-1" style={{ color: "#BA1A1A" }}>
                      ↳ {product.review_note}
                    </p>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 w-32">
                  <span className="text-sm font-semibold" style={{ color: "#6B4E2A" }}>{formatPrice(product.price)}</span>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(107,78,42,0.1)" }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${(product.price / Math.max(...products.map((p) => p.price))) * 100}%`, background: "linear-gradient(to right, #D5C3B0, #6B4E2A)" }} />
                  </div>
                </div>
                <button
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-2"
                  style={{ background: "rgba(107,78,42,0.08)", color: "#6B4E2A", border: "1px solid rgba(107,78,42,0.2)" }}
                  onClick={(e) => { e.stopPropagation(); setEditProduct(product); }}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Info note about review process ── */}
        {products.length > 0 && (
          <div className="mt-8 flex items-start gap-3 px-4 py-3.5 rounded-xl"
            style={{ background: "rgba(107,78,42,0.04)", border: "1px solid rgba(107,78,42,0.1)" }}>
            <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
            <p className="text-xs leading-relaxed" style={{ color: "#52432F" }}>
              <span className="font-semibold">Alur review:</span> Produk baru → Menunggu review admin → Disetujui (tampil di toko) atau Ditolak (dengan catatan). Produk yang diedit tidak otomatis kembali ke pending kecuali Anda menyimpan ulang.
            </p>
          </div>
        )}
      </div>

      <ProductFormModal open={addOpen} onClose={() => setAddOpen(false)} mode="create" />
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
