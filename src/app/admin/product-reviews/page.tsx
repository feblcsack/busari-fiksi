/**
 * /admin/product-reviews
 *
 * Dedicated product review queue page (as specified).
 * Mirrors /admin/reviews but with a focus on "queued/pending" products only.
 * Access is restricted to admin role (enforced by admin layout).
 */
import { adminGetAllProducts } from "@/actions/admin"
import { AdminReviewsClient } from "@/components/admin/admin-reviews-client"
import { Clock, CheckCircle2 } from "lucide-react"

export default async function AdminProductReviewsPage() {
  const products = await adminGetAllProducts()

  // Only show products that have status 'queued', 'pending', or null (legacy)
  const queuedProducts = products.filter(
    (p) => !p.status || p.status === "pending" || p.status === "queued"
  )
  const reviewedProducts = products.filter(
    (p) => p.status === "approved" || p.status === "rejected"
  )

  return (
    <div
      className="px-6 md:px-10 py-8 md:py-10"
      style={{ backgroundColor: "#FFF8F3", minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="mb-6">
        <p
          className="text-[11px] font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#6B4E2A" }}
        >
          Panel Admin
        </p>
        <h1
          className="text-3xl md:text-4xl font-normal"
          style={{
            fontFamily: "Libre Caslon Text, serif",
            color: "#201A14",
            letterSpacing: "-0.02em",
          }}
        >
          Antrean Review Produk
        </h1>
        <p className="text-sm mt-1" style={{ color: "#867462" }}>
          Tinjau produk dari seller sebelum dipublikasikan ke toko.
        </p>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(107,78,42,0.07)", border: "1px solid rgba(107,78,42,0.2)" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(107,78,42,0.12)" }}
          >
            <Clock className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              {queuedProducts.length}
            </p>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#867462" }}>
              Menunggu Review
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(92,96,41,0.07)", border: "1px solid rgba(92,96,41,0.2)" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(92,96,41,0.12)" }}
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: "#5C6029" }} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              {reviewedProducts.length}
            </p>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#867462" }}>
              Sudah Direview
            </p>
          </div>
        </div>
      </div>

      {/* Review client (reuses existing component) */}
      <AdminReviewsClient
        pendingProducts={queuedProducts}
        reviewedProducts={reviewedProducts}
      />
    </div>
  )
}
