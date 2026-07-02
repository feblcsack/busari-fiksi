import { adminGetAllUsers, adminGetAllProducts } from "@/actions/admin"
import { AdminUsersClient } from "@/components/admin/admin-users-client"

export default async function AdminUsersPage() {
  const [users, products] = await Promise.all([adminGetAllUsers(), adminGetAllProducts()])

  // Count products per user
  const productCountMap: Record<string, number> = {}
  products.forEach((p) => {
    productCountMap[p.user_id] = (productCountMap[p.user_id] ?? 0) + 1
  })

  const usersWithCount = users.map((u) => ({ ...u, productCount: productCountMap[u.id] ?? 0 }))

  return (
    <div className="px-6 md:px-10 py-8 md:py-10" style={{ backgroundColor: "#FFF8F3", minHeight: "100vh" }}>
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#6B4E2A" }}>Panel Admin</p>
        <h1 className="text-3xl md:text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
          Pengguna
        </h1>
        <p className="text-sm mt-1" style={{ color: "#867462" }}>{users.length} pengguna terdaftar.</p>
      </div>
      <AdminUsersClient users={usersWithCount} />
    </div>
  )
}
