"use client"

import { useState } from "react"
import { Sparkles, ChevronRight, User, Shirt } from "lucide-react"

// ─── DATA ─────────────────────────────────────────────────────────────────────

const MODELS = [
  {
    id: "woman",
    label: "Model Wanita",
    // TODO: ganti dengan foto model wanita kamu
    src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=85",
    tag: "Wanita",
  },
  {
    id: "man",
    label: "Model Pria",
    // TODO: ganti dengan foto model pria kamu
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=85",
    tag: "Pria",
  },
]

const GARMENTS = [
  {
    id: "batik-a",
    label: "Batik Klasik",
    // TODO: ganti dengan foto produk baju 1
    src: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=85",
    price: "Rp 285.000",
  },
  {
    id: "kemeja-b",
    label: "Kemeja Tenun",
    // TODO: ganti dengan foto produk baju 2
    src: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=85",
    price: "Rp 320.000",
  },
]

// ─── HASIL TRY-ON ──────────────────────────────────────────────────────────────
// Key: "modelId-garmentId" → URL foto hasil try-on yang kamu masukkan manual
// TODO: isi tiap kombinasi dengan foto hasilnya
const TRYON_RESULTS: Record<string, string> = {
  // "woman-batik-a": "/tryon-results/wanita-batik-klasik.jpg",
  // "woman-kemeja-b": "/tryon-results/wanita-kemeja-tenun.jpg",
  // "man-batik-a":   "/tryon-results/pria-batik-klasik.jpg",
  // "man-kemeja-b":  "/tryon-results/pria-kemeja-tenun.jpg",
}

// ─── SELECTION CARD ───────────────────────────────────────────────────────────

function SelectionCard({
  src, label, sublabel, selected, onClick,
}: {
  src: string; label: string; sublabel?: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden text-left transition-all duration-200 focus-visible:outline-none"
      style={{
        border: selected ? "2px solid #6B4E2A" : "2px solid #D5C3B0",
        boxShadow: selected ? "0 0 0 3px rgba(107,78,42,0.15)" : "none",
        transform: selected ? "translateY(-2px)" : "none",
      }}
    >
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4", background: "#F3E0CC" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="w-full h-full object-cover" />
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(107,78,42,0.12)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "#6B4E2A" }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5" style={{ background: selected ? "rgba(107,78,42,0.05)" : "#FDF3EC" }}>
        <p className="text-xs font-semibold truncate" style={{ color: "#201A14", fontFamily: "Hanken Grotesk, sans-serif" }}>{label}</p>
        {sublabel && <p className="text-[11px] mt-0.5" style={{ color: "#867462" }}>{sublabel}</p>}
      </div>
    </button>
  )
}

// ─── MAIN CLIENT COMPONENT ────────────────────────────────────────────────────

export function TryOnClient() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedGarment, setSelectedGarment] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [tried, setTried] = useState(false)

  const canTry = selectedModel !== null && selectedGarment !== null

  const handleTryOn = () => {
    if (!canTry) return
    const key = `${selectedModel}-${selectedGarment}`
    setResult(TRYON_RESULTS[key] ?? null)
    setTried(true)
  }

  const handleReset = () => {
    setSelectedModel(null)
    setSelectedGarment(null)
    setResult(null)
    setTried(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── LEFT: Selections ── */}
      <div className="space-y-6">

        {/* Step 1 — Pilih Model */}
        <div className="rounded-2xl p-5" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#6B4E2A", color: "#FFFFFF" }}>1</div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
              <p className="text-sm font-semibold" style={{ color: "#201A14" }}>Pilih Model</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MODELS.map((m) => (
              <SelectionCard
                key={m.id}
                src={m.src}
                label={m.label}
                sublabel={m.tag}
                selected={selectedModel === m.id}
                onClick={() => { setSelectedModel(m.id); setTried(false) }}
              />
            ))}
          </div>
        </div>

        {/* Step 2 — Pilih Baju */}
        <div className="rounded-2xl p-5" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#6B4E2A", color: "#FFFFFF" }}>2</div>
            <div className="flex items-center gap-1.5">
              <Shirt className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
              <p className="text-sm font-semibold" style={{ color: "#201A14" }}>Pilih Baju</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {GARMENTS.map((g) => (
              <SelectionCard
                key={g.id}
                src={g.src}
                label={g.label}
                sublabel={g.price}
                selected={selectedGarment === g.id}
                onClick={() => { setSelectedGarment(g.id); setTried(false) }}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleTryOn}
          disabled={!canTry}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]"
          style={{
            background: canTry ? "#6B4E2A" : "rgba(107,78,42,0.1)",
            color: canTry ? "#FFFFFF" : "#D5C3B0",
            cursor: canTry ? "pointer" : "not-allowed",
          }}
        >
          <Sparkles className="w-4 h-4" strokeWidth={2} />
          {canTry ? "Lihat Hasilnya" : "Pilih model & baju dulu"}
          {canTry && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* ── RIGHT: Result ── */}
      <div className="flex flex-col">
        <div className="rounded-2xl overflow-hidden flex-1 flex flex-col"
          style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", minHeight: "480px" }}>

          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(107,78,42,0.08)" }}>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#867462" }}>
              Hasil Try-On
            </p>
            {tried && (
              <button onClick={handleReset}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:bg-black/5"
                style={{ color: "#6B4E2A", border: "1px solid rgba(107,78,42,0.2)" }}>
                Coba Lagi
              </button>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center p-5">
            {!tried ? (
              <div className="w-full flex flex-col items-center gap-4 text-center py-8">
                <div className="flex items-center gap-3 justify-center w-full">
                  <div className="flex-1 max-w-[140px]">
                    {selectedModel ? (
                      <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "3/4", border: "2px solid #6B4E2A" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={MODELS.find(m => m.id === selectedModel)!.src} alt="Model" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="rounded-xl flex items-center justify-center"
                        style={{ aspectRatio: "3/4", background: "rgba(107,78,42,0.06)", border: "2px dashed #D5C3B0" }}>
                        <User className="w-8 h-8" style={{ color: "#D5C3B0" }} strokeWidth={1.2} />
                      </div>
                    )}
                    <p className="text-[11px] mt-1.5" style={{ color: "#867462" }}>
                      {selectedModel ? MODELS.find(m => m.id === selectedModel)!.label : "Model"}
                    </p>
                  </div>

                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(107,78,42,0.08)", color: "#6B4E2A", fontSize: "18px", fontWeight: 300 }}>+</div>

                  <div className="flex-1 max-w-[140px]">
                    {selectedGarment ? (
                      <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "3/4", border: "2px solid #6B4E2A" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={GARMENTS.find(g => g.id === selectedGarment)!.src} alt="Baju" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="rounded-xl flex items-center justify-center"
                        style={{ aspectRatio: "3/4", background: "rgba(107,78,42,0.06)", border: "2px dashed #D5C3B0" }}>
                        <Shirt className="w-8 h-8" style={{ color: "#D5C3B0" }} strokeWidth={1.2} />
                      </div>
                    )}
                    <p className="text-[11px] mt-1.5" style={{ color: "#867462" }}>
                      {selectedGarment ? GARMENTS.find(g => g.id === selectedGarment)!.label : "Baju"}
                    </p>
                  </div>
                </div>

                {!selectedModel && !selectedGarment && (
                  <p className="text-sm mt-2" style={{ color: "#D5C3B0" }}>
                    Pilih model & baju di sebelah kiri untuk memulai
                  </p>
                )}
                {canTry && (
                  <p className="text-xs mt-1 animate-pulse" style={{ color: "#6B4E2A" }}>
                    Kombinasi siap → Klik &ldquo;Lihat Hasilnya&rdquo;
                  </p>
                )}
              </div>
            ) : result ? (
              <div className="w-full h-full">
                <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "3/4", maxHeight: "480px", margin: "0 auto" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result} alt="Hasil Try-On" className="w-full h-full object-cover" />
                </div>
                <p className="text-center text-xs mt-3" style={{ color: "#867462" }}>
                  {MODELS.find(m => m.id === selectedModel)?.label} ·{" "}
                  {GARMENTS.find(g => g.id === selectedGarment)?.label}
                </p>
              </div>
            ) : (
              <div className="text-center px-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(107,78,42,0.06)" }}>
                  <Sparkles className="w-8 h-8" style={{ color: "#D5C3B0" }} strokeWidth={1.2} />
                </div>
                <p className="text-base font-normal mb-1"
                  style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
                  Foto sedang disiapkan
                </p>
                <p className="text-sm" style={{ color: "#867462" }}>
                  Kombinasi{" "}
                  <span style={{ color: "#6B4E2A" }}>{MODELS.find(m => m.id === selectedModel)?.label}</span>
                  {" "}+{" "}
                  <span style={{ color: "#6B4E2A" }}>{GARMENTS.find(g => g.id === selectedGarment)?.label}</span>
                  {" "}belum tersedia. Coba kombinasi lain.
                </p>
                <button onClick={handleReset}
                  className="mt-4 text-sm px-4 py-2 rounded-xl transition-all hover:brightness-95"
                  style={{ background: "rgba(107,78,42,0.08)", color: "#6B4E2A", border: "1px solid rgba(107,78,42,0.2)" }}>
                  Coba Kombinasi Lain
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
