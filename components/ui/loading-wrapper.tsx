"use client"

import { ReactNode, useEffect, useState } from "react"
import { LoadingSkeleton } from "./loading-skeleton"

interface LoadingWrapperProps {
  children: ReactNode
  loading: boolean
  skeleton?: ReactNode
  minLoadingTime?: number
  className?: string
}

export function LoadingWrapper({ 
  children, 
  loading, 
  skeleton, 
  minLoadingTime = 300,
  className = ""
}: LoadingWrapperProps) {
  const [showContent, setShowContent] = useState(!loading)
  const [internalLoading, setInternalLoading] = useState(loading)

  useEffect(() => {
    if (loading) {
      setInternalLoading(true)
      setShowContent(false)
      
      // Ensure minimum loading time for better UX
      const timer = setTimeout(() => {
        setShowContent(true)
      }, minLoadingTime)
      
      return () => clearTimeout(timer)
    } else {
      setInternalLoading(false)
      setShowContent(true)
    }
  }, [loading, minLoadingTime])

  if (internalLoading && !showContent) {
    return (
      <div className={className}>
        {skeleton || <LoadingSkeleton variant="default" count={6} />}
      </div>
    )
  }

  return <div className={className}>{children}</div>
}

interface PageLoadingWrapperProps {
  children: ReactNode
  loading: boolean
  title?: string
  description?: string
}

export function PageLoadingWrapper({ 
  children, 
  loading, 
  title = "Loading...",
  description = "Please wait while we load your data"
}: PageLoadingWrapperProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-muted rounded w-20"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
