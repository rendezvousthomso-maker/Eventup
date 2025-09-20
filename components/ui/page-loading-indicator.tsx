"use client"

import { useEffect, useState } from "react"
import { useLoading } from "./loading-provider"

export function PageLoadingIndicator() {
  const { isLoading } = useLoading()
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setShowIndicator(true)
    } else {
      // Delay hiding to prevent flickering
      const timer = setTimeout(() => setShowIndicator(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!showIndicator) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="h-full bg-gradient-to-r from-blue-600 to-purple-700 animate-pulse"></div>
    </div>
  )
}
