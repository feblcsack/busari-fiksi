import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";
import { Libre_Caslon_Text, Hanken_Grotesk } from "next/font/google";

export const metadata: Metadata = {
  title: "Toko — Kelola Produkmu",
  description: "Platform e-commerce sederhana untuk mengelola dan menampilkan produkmu secara online.",
};

const caslon = Libre_Caslon_Text({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-caslon"
});

const hanken = Hanken_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-hanken"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f8f9fc] {`${caslon.variable} ${hanken.variable} font-sans bg-[#151311] text-[#e8e1dd] antialiased`}">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
