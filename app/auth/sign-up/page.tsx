"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login since we only have Google OAuth
    router.push("/auth/login")
  }, [router])

  return null
}
