import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";
import { GlobalCart } from "@/components/cart/global-cart";
import { Libre_Caslon_Text, Hanken_Grotesk } from "next/font/google";

export const metadata: Metadata = {
  title: {
    default: "Busari — Fashion UMKM Nusantara",
    template: "%s | Busari",
  },
  description: "Platform fashion artisanal Indonesia. Temukan batik, tenun, dan songket dari pengrajin UMKM lokal terbaik Nusantara.",
  keywords: ["UMKM", "batik", "tenun", "songket", "fashion lokal", "pengrajin Indonesia"],
  authors: [{ name: "Busari" }],
  creator: "Busari",
  metadataBase: new URL("https://busari.id"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Busari",
  },
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
        <GlobalCart />
        <ToastContainer />
      </body>
    </html>
  );
}
