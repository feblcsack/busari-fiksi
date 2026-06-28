import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Ini yang udah lu tambahin kemarin buat Supabase
      {
        protocol: "https",
        hostname: "nnjghpnkzmrupldznetr.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // INI YANG BARU: Buat izinin foto profil dari Google
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**", // Izinin semua jalur gambar dari domain ini
      },
    ],
  },
};

export default nextConfig;