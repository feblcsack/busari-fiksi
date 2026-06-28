"use client"

import * as React from "react"
import { CheckCircle, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  message: string
  type: "success" | "error"
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2 fade-in",
        type === "success"
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-red-50 text-red-800 border border-red-200"
      )}
    >
      {type === "success" ? (
        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

interface ToastState {
  message: string
  type: "success" | "error"
  id: number
}

let toastCount = 0
const listeners: Array<(toast: ToastState | null) => void> = []

export function showToast(message: string, type: "success" | "error" = "success") {
  const id = ++toastCount
  const toast = { message, type, id }
  listeners.forEach((l) => l(toast))
  setTimeout(() => {
    listeners.forEach((l) => l(null))
  }, 3500)
}

export function ToastContainer() {
  const [toast, setToast] = React.useState<ToastState | null>(null)

  React.useEffect(() => {
    listeners.push(setToast)
    return () => {
      const idx = listeners.indexOf(setToast)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  if (!toast) return null

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  )
}
