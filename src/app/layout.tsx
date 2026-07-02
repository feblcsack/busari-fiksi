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
    <html lang="id" className={`h-full antialiased ${caslon.variable} ${hanken.variable}`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#FFF8F3", color: "#201A14", fontFamily: "var(--font-hanken), Hanken Grotesk, sans-serif" }}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
