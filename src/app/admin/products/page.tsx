import { adminGetAllProducts, adminGetAllUsers } from "@/actions/admin"
import { AdminProductsClient } from "@/components/admin/admin-products-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Semua Produk — Admin Busari",
  description: "Kelola seluruh produk dari semua seller di platform Busari.",
}

export default async function AdminProductsPage() {
  const [products, users] = await Promise.all([adminGetAllProducts(), adminGetAllUsers()])

  return (
    <div className="px-6 md:px-10 py-8 md:py-10" style={{ backgroundColor: "#FFF8F3", minHeight: "100vh" }}>
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#6B4E2A" }}>Panel Admin</p>
        <h1 className="text-3xl md:text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
          Semua Produk
        </h1>
        <p className="text-sm mt-1" style={{ color: "#867462" }}>{products.length} produk dari seluruh penjual.</p>
      </div>
      <AdminProductsClient products={products} users={users} />
    </div>
  )
}
