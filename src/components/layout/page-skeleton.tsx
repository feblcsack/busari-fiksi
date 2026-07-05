/**
 * Reusable skeleton shimmer component.
 * Dipakai di semua loading.tsx agar konsisten.
 */

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className ?? ""}`}
      style={{ background: "linear-gradient(90deg, #F3E0CC 25%, #FDF3EC 50%, #F3E0CC 75%)", backgroundSize: "200% 100%", ...style }}
    />
  )
}

export function ShopSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: "#FFF8F3" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(to bottom, #F3E0CC, #FFF8F3)", borderBottom: "1px solid #D5C3B0" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-10 pt-10 pb-8">
          <Shimmer className="h-3 w-24 mb-3" />
          <Shimmer className="h-9 w-48 mb-2" />
          <Shimmer className="h-4 w-32" />
        </div>
      </div>
      {/* Filter */}
      <div className="sticky top-0 z-20" style={{ background: "rgba(255,248,243,0.95)", borderBottom: "1px solid #D5C3B0" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-3 flex gap-3">
          <Shimmer className="flex-1 h-9" />
          <Shimmer className="w-24 h-9" />
        </div>
      </div>
      {/* Grid */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
              <Shimmer className="w-full rounded-none" style={{ aspectRatio: "4/5" }} />
              <div className="px-3.5 py-3.5 space-y-2">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-20" />
                <Shimmer className="h-8 w-full mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen pb-28" style={{ background: "#FFF8F3" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
        {/* Greeting */}
        <div className="mb-10">
          <Shimmer className="h-3 w-20 mb-3" />
          <Shimmer className="h-12 w-48 mb-2" />
          <Shimmer className="h-4 w-64" />
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
              <Shimmer className="w-9 h-9 mb-4" />
              <Shimmer className="h-3 w-20 mb-2" />
              <Shimmer className="h-7 w-28 mb-1" />
              <Shimmer className="h-3 w-16" />
            </div>
          ))}
        </div>
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <Shimmer className="h-4 w-32 mb-4" />
            <Shimmer className="h-24 w-full" />
          </div>
          <div className="rounded-2xl" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", aspectRatio: "3/4" }}>
            <Shimmer className="w-full h-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminSkeleton() {
  return (
    <div className="px-6 md:px-10 py-8 md:py-10" style={{ background: "#FFF8F3", minHeight: "100vh" }}>
      <Shimmer className="h-3 w-20 mb-2" />
      <Shimmer className="h-10 w-48 mb-2" />
      <Shimmer className="h-4 w-64 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <Shimmer className="w-8 h-8 mb-3" />
            <Shimmer className="h-6 w-12 mb-1" />
            <Shimmer className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", height: "400px" }}>
          <Shimmer className="w-full h-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
              <Shimmer className="h-4 w-24 mb-3" />
              <Shimmer className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function GenericPageSkeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div className="min-h-screen pb-28" style={{ background: "#FFF8F3" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-14 pb-8">
        <Shimmer className="h-3 w-24 mb-4" />
        <Shimmer className="h-12 w-64 mb-3" />
        <Shimmer className="h-5 w-96 mb-10" />
        <div className="space-y-4">
          {Array.from({ length: lines }).map((_, i) => (
            <Shimmer key={i} className="h-5 w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
