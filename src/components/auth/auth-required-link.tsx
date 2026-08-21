"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TermsModal } from "@/components/terms/terms-modal"
import { hasAcceptedTerms } from "@/hooks/use-terms-modal"
import { showToast } from "@/components/ui/toast"

interface AuthRequiredLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  requireAuth?: boolean
}

export function AuthRequiredLink({ href, children, className, requireAuth = true }: AuthRequiredLinkProps) {
  const router = useRouter()
  const [showTermsModal, setShowTermsModal] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    if (requireAuth) {
      // Show message to login first
      showToast("Silakan login terlebih dahulu untuk mengakses fitur ini", "info")
      return
    }

    // Check if terms accepted
    if (!hasAcceptedTerms()) {
      setShowTermsModal(true)
      return
    }

    router.push(href)
  }

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setShowTermsModal(false)
          router.push(href)
        }}
        mode="consent"
        title="Sebelum Melanjutkan"
        description="Dengan melanjutkan, Anda setuju dengan syarat dan ketentuan kami."
      />
    </>
  )
}
