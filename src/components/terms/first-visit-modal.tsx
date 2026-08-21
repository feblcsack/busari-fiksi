"use client"

import { TermsModal } from "./terms-modal"
import { useTermsModal } from "@/hooks/use-terms-modal"

export function FirstVisitModal() {
  const { showModal, acceptTerms, closeModal } = useTermsModal()

  return (
    <TermsModal
      isOpen={showModal}
      onClose={closeModal}
      onAccept={acceptTerms}
      mode="consent"
      title="Selamat Datang di Busari"
      description="Sebelum melanjutkan, mohon baca dan setujui syarat & ketentuan kami."
    />
  )
}
