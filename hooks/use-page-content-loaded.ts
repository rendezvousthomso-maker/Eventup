"use client"

import { useEffect, useState } from "react"
import { useLoading } from "@/components/ui/loading-provider"

interface UsePageContentLoadedProps {
  loadingKey: string
  dependencies?: any[]
  minLoadingTime?: number
}

export function usePageContentLoaded({ 
  loadingKey, 
  dependencies = [], 
  minLoadingTime = 1200 
}: UsePageContentLoadedProps) {
  const { setPageLoading } = useLoading()
  const [isContentReady, setIsContentReady] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Mark content as ready when dependencies change (form is rendered)
    setIsContentReady(true)
  }, [loadingKey, ...dependencies])

  useEffect(() => {
    if (!isContentReady) return

    const checkAndHideLoader = () => {
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
      
      setTimeout(() => {
        setPageLoading(loadingKey, false)
      }, remainingTime)
    }

    checkAndHideLoader()
  }, [isContentReady, loadingKey, setPageLoading, minLoadingTime, startTime])
}
