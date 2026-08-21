"use client"

import { useState, useEffect } from "react"

const TERMS_ACCEPTED_KEY = "busari_terms_accepted"
const TERMS_VERSION = "v1_2026" // Update this when terms change

export function useTermsModal() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Check if user has already accepted current version
    const acceptedVersion = localStorage.getItem(TERMS_ACCEPTED_KEY)
    
    if (acceptedVersion !== TERMS_VERSION) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptTerms = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, TERMS_VERSION)
    setShowModal(false)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return {
    showModal,
    acceptTerms,
    closeModal
  }
}

export function hasAcceptedTerms(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(TERMS_ACCEPTED_KEY) === TERMS_VERSION
}
