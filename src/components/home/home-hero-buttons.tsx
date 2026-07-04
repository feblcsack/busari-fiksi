"use client"

import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { useState } from "react"

export function HomeHeroButtons() {
  const [shopHover, setShopHover] = useState(false)

  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/dashboard">
        <button
          className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:brightness-95 active:scale-[0.98]"
          style={{ background: "#6B4E2A", color: "#FFFFFF" }}
        >
          Mulai Gratis <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
      <Link href="/shop">
        <button
          className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
          style={{
            background: shopHover ? "#F3E0CC" : "transparent",
            color: "#52432F",
            border: "1px solid #D5C3B0",
          }}
          onMouseEnter={() => setShopHover(true)}
          onMouseLeave={() => setShopHover(false)}
        >
          <ShoppingBag className="w-4 h-4" /> Lihat Toko
        </button>
      </Link>
    </div>
  )
}
