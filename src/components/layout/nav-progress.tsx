"use client"

/**
 * NavProgress — top progress bar saat navigasi antar halaman.
 * Menggunakan usePathname untuk deteksi perubahan route.
 * Tidak butuh library tambahan — pure CSS animation.
 */

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function NavProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPathRef = useRef(pathname)

  useEffect(() => {
    // Pathname changed → navigation completed
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname

      // Complete the bar
      setProgress(100)
      if (intervalRef.current) clearInterval(intervalRef.current)

      const done = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 300)

      return () => clearTimeout(done)
    }
  }, [pathname])

  // Simulate progress on link click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      // Only trigger for internal navigation links
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("tel") ||
        target.getAttribute("target") === "_blank"
      ) return

      // Start progress
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)

      setProgress(5)
      setVisible(true)

      let current = 5
      intervalRef.current = setInterval(() => {
        // Slow down as it approaches 85%
        const increment = current < 30 ? 8 : current < 60 ? 4 : current < 80 ? 1.5 : 0.3
        current = Math.min(current + increment, 85)
        setProgress(current)
      }, 100)
    }

    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!visible && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      style={{ background: "rgba(107,78,42,0.08)" }}
    >
      <div
        className="h-full"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(to right, #6B4E2A, #FFDDB8)",
          transition: progress === 100
            ? "width 0.2s ease-out"
            : "width 0.1s linear",
          opacity: visible ? 1 : 0,
          boxShadow: "0 0 8px rgba(107,78,42,0.6)",
        }}
      />
    </div>
  )
}
