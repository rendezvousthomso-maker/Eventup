"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Replace current history entry to prevent back navigation issues
    // This ensures that when users navigate back, they go to home page instead of this redirect page
    router.replace("/auth/login")
  }, [router])

  // Add popstate event listener to handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      // If user navigates back to this page, redirect them to home
      router.replace("/")
    }

    window.addEventListener("popstate", handlePopState)
    
    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [router])

  return null
}
