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
    const data = result.data as any[]
    if (data && data[0] && data[0][0] && data[0][0].image) {
      return { success: true, url: data[0][0].image.url }
    }

    throw new Error("Gagal memproses gambar dari AI.")
  } catch (error: any) {
    console.error("AI Try-On Error:", error)
    // Error handling kalau server Hugging Face lagi kepenuhan (Queue Full)
    return { 
      success: false, 
      error: error.message || "Server AI sedang sibuk/penuh. Coba beberapa saat lagi." 
    }
  }
}