import { Navbar } from "@/components/layout/navbar"
import { getProfile } from "@/actions/profile" // Pastikan import action ini sesuai dengan path lu

export default async function Home() {
  // Ambil data profile dari server/Supabase
  const profile = await getProfile()

  return (
    <>
      <div className="min-h-screen">
        {/* Lempar data profile ke dalam props */}
        <Navbar profile={profile} />
        <h1>Home</h1>
      </div>
    </>
  )
}