"use client"

import { useState } from "react"
import { Sparkles, ArrowRight, Loader2, Image as ImageIcon, AlertTriangle } from "lucide-react"
import { generateTryOn } from "@/actions/try-on"

// URL Gambar Dummy untuk Testing (Langsung dari Unsplash)
const DUMMY_MODELS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80", // Model Wanita
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80", // Model Pria
]

const DUMMY_GARMENTS = [
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80", // Kaos Putih (Biar gampang dites pattern-nya)
  "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&q=80", // Kemeja Pattern
]

export default function TryOnPage() {
  const [selectedModel, setSelectedModel] = useState<string>(DUMMY_MODELS[0])
  const [selectedGarment, setSelectedGarment] = useState<string>(DUMMY_GARMENTS[0])
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleTryOn = async () => {
    setIsProcessing(true)
    setErrorMessage(null)
    setResultImage(null)

    try {
      // Panggil Server Action ke Hugging Face
      const res = await generateTryOn(selectedModel, selectedGarment)
      
      if (res.success && res.url) {
        setResultImage(res.url)
      } else {
        setErrorMessage(res.error || "Gagal memproses gambar.")
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan jaringan.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div 
      className="min-h-screen pt-24 pb-32 px-4 sm:px-6"
      style={{ backgroundColor: "#151311", color: "#e8e1dd", fontFamily: "var(--font-hanken), sans-serif" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 border" style={{ backgroundColor: "rgba(245, 196, 81, 0.1)", borderColor: "rgba(245, 196, 81, 0.2)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "#f5c451" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#f5c451" }}>Live AI Demo</span>
          </div>
          <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "var(--font-caslon), serif", color: "#e8e1dd" }}>
            Experience the Fit, <span style={{ color: "#d2c5b0" }}>Virtually.</span>
          </h1>
          <p className="text-sm md:text-base mb-2" style={{ color: "#9b8f7c" }}>
            Pilih foto model dan pakaian di bawah ini untuk menguji teknologi Virtual Try-On kami.
          </p>
          <p className="text-xs text-amber-500/80">
            *Menggunakan server publik gratis. Proses mungkin memakan waktu 1-3 menit tergantung antrean.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Pilih Model */}
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: "#1d1b19", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#f5c451", color: "#3f2e00" }}>1</div>
                <h3 className="text-lg" style={{ fontFamily: "var(--font-caslon), serif" }}>Pilih Model (Kamu)</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DUMMY_MODELS.map((url, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    key={idx} src={url} alt={`Model ${idx}`}
                    onClick={() => setSelectedModel(url)}
                    className="w-full aspect-[3/4] object-cover rounded-xl cursor-pointer border-2 transition-all"
                    style={{ borderColor: selectedModel === url ? "#f5c451" : "transparent" }}
                  />
                ))}
              </div>
            </div>

            {/* Step 2: Pilih Baju */}
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: "#1d1b19", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#f5c451", color: "#3f2e00" }}>2</div>
                <h3 className="text-lg" style={{ fontFamily: "var(--font-caslon), serif" }}>Pilih Baju (Pattern)</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DUMMY_GARMENTS.map((url, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    key={idx} src={url} alt={`Garment ${idx}`}
                    onClick={() => setSelectedGarment(url)}
                    className="w-full aspect-[3/4] object-cover rounded-xl cursor-pointer border-2 transition-all bg-white"
                    style={{ borderColor: selectedGarment === url ? "#f5c451" : "transparent" }}
                  />
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleTryOn}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#f5c451", color: "#3f2e00" }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses AI (Bisa butuh 1-2 Menit)...
                </>
              ) : (
                <>
                  Generate Virtual Try-On <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* RIGHT PANEL: Result */}
          <div className="lg:col-span-7">
            <div 
              className="w-full h-full min-h-[600px] rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: "#1d1b19", borderColor: "rgba(255,255,255,0.08)" }}
            >
              {isProcessing ? (
                <div className="text-center px-4">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 animate-spin" style={{ borderColor: "#f5c451" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 animate-pulse" style={{ color: "#f5c451" }} />
                    </div>
                  </div>
                  <h3 className="text-2xl mb-2" style={{ fontFamily: "var(--font-caslon), serif", color: "#f5c451" }}>Sedang Mengantre di Server</h3>
                  <p className="text-sm max-w-md mx-auto" style={{ color: "#9b8f7c" }}>
                    Karena kita pakai AI publik gratis, sistem sedang menyesuaikan pattern baju ke postur model... Jangan tutup halaman ini.
                  </p>
                </div>
              ) : errorMessage ? (
                <div className="text-center px-6 text-red-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-xl mb-2 font-semibold">Yah, Gagal!</h3>
                  <p className="text-sm max-w-sm mx-auto opacity-80">{errorMessage}</p>
                </div>
              ) : resultImage ? (
                <div className="w-full h-full relative p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={resultImage} alt="Try On Result" className="w-full h-full object-contain rounded-xl" />
                </div>
              ) : (
                <div className="text-center px-6">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: "#d2c5b0" }} />
                  <h3 className="text-xl mb-2" style={{ fontFamily: "var(--font-caslon), serif", color: "#5a544e" }}>Area Simulasi</h3>
                  <p className="text-sm max-w-sm mx-auto" style={{ color: "#5a544e" }}>
                    Hasil akan muncul di sini. Klik tombol Generate di sebelah kiri untuk melihat keajaiban AI.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}