import { adminGetAllProducts } from "@/actions/admin"
import { AdminReviewsClient } from "@/components/admin/admin-reviews-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Review Produk — Admin Busari",
  description: "Review dan approve produk seller sebelum tampil di toko publik.",
}

export default async function AdminReviewsPage() {
  const products = await adminGetAllProducts()
  const pending = products.filter((p) => !p.status || p.status === "pending")
  const reviewed = products.filter((p) => p.status === "approved" || p.status === "rejected")

  return (
    <div className="px-6 md:px-10 py-8 md:py-10" style={{ backgroundColor: "#FFF8F3", minHeight: "100vh" }}>
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#6B4E2A" }}>Panel Admin</p>
        <h1 className="text-3xl md:text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
          Review Produk
        </h1>
        <p className="text-sm mt-1" style={{ color: "#867462" }}>
          {pending.length} produk menunggu review · {reviewed.length} sudah direview
        </p>
      </div>
      <AdminReviewsClient pendingProducts={pending} reviewedProducts={reviewed} />
    </div>
  )
}
