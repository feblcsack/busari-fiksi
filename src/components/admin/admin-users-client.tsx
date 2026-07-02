"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Profile } from "@/types"
import { adminUpdateUserRole, adminDeleteAllUserProducts } from "@/actions/admin"
import { showToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import { Search, X, Shield, User, Package, Trash2 } from "lucide-react"

type UserWithCount = Profile & { productCount: number }

interface AdminUsersClientProps {
  users: UserWithCount[]
}

export function AdminUsersClient({ users }: AdminUsersClientProps) {
  const [search, setSearch] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = users.filter((u) =>
    (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const router = useRouter()

  const handleRoleToggle = async (userId: string, currentRole: string | null | undefined) => {
    const newRole = currentRole === "admin" ? "user" : "admin"
    if (!confirm(`Ubah role menjadi "${newRole}"?`)) return
    setUpdatingId(userId)
    try {
      await adminUpdateUserRole(userId, newRole)
      showToast(`Role diubah menjadi ${newRole}`, "success")
      router.refresh()
    } catch {
      showToast("Gagal mengubah role", "error")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteProducts = async (userId: string, name: string) => {
    if (!confirm(`Hapus semua produk milik ${name ?? "pengguna ini"}? Tindakan ini tidak bisa dibatalkan.`)) return
    setDeletingId(userId)
    try {
      await adminDeleteAllUserProducts(userId)
      showToast("Semua produk pengguna berhasil dihapus", "success")
    } catch {
      showToast("Gagal menghapus produk", "error")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#867462" }} strokeWidth={1.8} />
        <input type="text" placeholder="Cari pengguna..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-8 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0", color: "#201A14" }}
          onFocus={(e) => { e.target.style.borderColor = "#6B4E2A" }}
          onBlur={(e) => { e.target.style.borderColor = "#D5C3B0" }} />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5" style={{ color: "#867462" }} /></button>}
      </div>

      <p className="text-xs mb-4" style={{ color: "#867462" }}>{filtered.length} pengguna</p>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #D5C3B0" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            <thead>
              <tr style={{ background: "#F3E0CC", borderBottom: "1px solid #D5C3B0" }}>
                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>Pengguna</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-widest uppercase hidden sm:table-cell" style={{ color: "#867462" }}>Role</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-widest uppercase hidden md:table-cell" style={{ color: "#867462" }}>Produk</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-widest uppercase hidden lg:table-cell" style={{ color: "#867462" }}>Bergabung</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center" style={{ color: "#867462" }}>
                    <User className="w-8 h-8 mx-auto mb-2" style={{ color: "#D5C3B0" }} />
                    Tidak ada pengguna ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((user, idx) => (
                  <tr key={user.id} className="transition-colors hover:bg-black/[0.02]"
                    style={{ backgroundColor: idx % 2 === 0 ? "#FFF8F3" : "#FDF3EC", borderBottom: idx < filtered.length - 1 ? "1px solid rgba(107,78,42,0.06)" : "none" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: "#F3E0CC" }}>
                          {user.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatar_url} alt={user.full_name ?? ""} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold" style={{ color: "#6B4E2A" }}>
                              {(user.full_name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[160px]" style={{ color: "#201A14" }}>{user.full_name ?? "—"}</p>
                          <p className="text-xs truncate max-w-[160px] mt-0.5" style={{ color: "#867462" }}>{user.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: user.role === "admin" ? "rgba(107,78,42,0.12)" : "rgba(107,78,42,0.05)",
                          color: user.role === "admin" ? "#6B4E2A" : "#867462",
                          border: `1px solid ${user.role === "admin" ? "rgba(107,78,42,0.3)" : "rgba(107,78,42,0.1)"}`,
                        }}>
                        {user.role === "admin" ? "admin" : "user"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" style={{ color: "#D5C3B0" }} strokeWidth={1.8} />
                        <span style={{ color: "#52432F" }}>{user.productCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell" style={{ color: "#867462" }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleRoleToggle(user.id, user.role)} disabled={updatingId === user.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                          style={{
                            background: user.role === "admin" ? "rgba(107,78,42,0.12)" : "rgba(107,78,42,0.06)",
                            color: "#6B4E2A"
                          }}
                          title={user.role === "admin" ? "Hapus hak admin" : "Jadikan admin"}>
                          <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                        {user.productCount > 0 && (
                          <button onClick={() => handleDeleteProducts(user.id, user.full_name ?? "")} disabled={deletingId === user.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                            style={{ background: "rgba(186,26,26,0.08)", color: "#BA1A1A" }}
                            title={`Hapus semua ${user.productCount} produk`}>
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
