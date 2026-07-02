"use server"

import { client, handle_file } from "@gradio/client"

export async function generateTryOn(modelUrl: string, garmentUrl: string) {
  try {
    // Konek ke Space publik OOTDiffusion di Hugging Face
    const app = await client("levihsu/OOTDiffusion")

    // Proses manggil AI
    // Parameter: [Foto Model, Foto Baju, Kategori, N_Samples, N_Steps, Image_Scale, Seed]
    const result = await app.predict("/process_hd", [
      handle_file(modelUrl),
      handle_file(garmentUrl),
      "Upper-body", // Karena kita test pakai baju atasan
      1,
      20,
      2,
      -1,
    ])

    // Mengambil URL hasil gambar dari output Gradio
    const data = Array.isArray(result.data) ? result.data as unknown[] : []
    if (
      Array.isArray(data[0]) &&
      data[0][0] &&
      typeof data[0][0] === "object" &&
      data[0][0] !== null &&
      "image" in data[0][0]
    ) {
      const imageEntry = (data[0][0] as { image?: { url?: string } }).image
      if (imageEntry?.url) {
        return { success: true, url: imageEntry.url }
      }
    }

    throw new Error("Gagal memproses gambar dari AI.")
  } catch (error: any) {
    console.error("AI Try-On Error:", error)
    // Error handling kalau server Hugging Face lagi kepenuhan (Queue Full)
    return {
      success: false,
      error: error.message || "Server AI sedang sibuk/penuh. Coba beberapa saat lagi.",
    }
  }
}