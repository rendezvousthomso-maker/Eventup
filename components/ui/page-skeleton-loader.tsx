"use client"

import { useEffect, useState } from "react"
import { useLoading } from "./loading-provider"
import { LoadingSkeleton } from "./loading-skeleton"

interface PageSkeletonLoaderProps {
  loadingKeys: string[]
}

export function PageSkeletonLoader({ loadingKeys }: PageSkeletonLoaderProps) {
  const { loadingStates } = useLoading()
  const [showLoader, setShowLoader] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Check if any of the specified loading keys are active
  const isAnyLoading = loadingKeys.some(key => loadingStates[key])

  useEffect(() => {
    if (isAnyLoading) {
      setShowLoader(true)
      setIsFadingOut(false)
    } else {
      // Start fade out animation
      setIsFadingOut(true)
      // Delay hiding to prevent flickering and ensure smooth transition
      const timer = setTimeout(() => setShowLoader(false), 800)
      return () => clearTimeout(timer)
    }
  }, [isAnyLoading])

  if (!showLoader) return null

  const getSkeletonContent = () => {
    if (loadingKeys.includes('dashboard')) {
      return <DashboardSkeleton />
    } else if (loadingKeys.includes('host-event')) {
      return <CreateEventSkeleton />
    }
    return <DefaultSkeleton />
  }

  return (
    <div className={`fixed inset-0 z-[9999] bg-white/95 backdrop-blur-sm flex items-center justify-center transition-opacity duration-700 ${
      isFadingOut ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="w-full max-w-4xl mx-4 p-6">
        {getSkeletonContent()}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton className="h-4 w-96" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-4">
        <LoadingSkeleton variant="button" count={4} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <LoadingSkeleton className="h-4 w-24" />
            <LoadingSkeleton className="h-8 w-16" />
            <LoadingSkeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        <LoadingSkeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <LoadingSkeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <LoadingSkeleton className="h-4 w-3/4" />
                <LoadingSkeleton className="h-3 w-1/2" />
                <div className="space-y-2">
                  <LoadingSkeleton className="h-3 w-full" />
                  <LoadingSkeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CreateEventSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-4 w-96" />
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Event Title */}
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-20" />
          <LoadingSkeleton className="h-10 w-full" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-24" />
          <LoadingSkeleton className="h-24 w-full" />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <LoadingSkeleton className="h-4 w-16" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <LoadingSkeleton className="h-4 w-16" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-20" />
          <LoadingSkeleton className="h-10 w-full" />
        </div>

        {/* Capacity and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <LoadingSkeleton className="h-4 w-20" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <LoadingSkeleton className="h-4 w-16" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-24" />
          <div className="border-2 border-dashed rounded-lg p-8 flex items-center justify-center">
            <LoadingSkeleton className="h-16 w-16 rounded-full" />
          </div>
        </div>

        {/* Submit Button */}
        <LoadingSkeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

function DefaultSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <LoadingSkeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <LoadingSkeleton className="h-4 w-3/4" />
              <LoadingSkeleton className="h-3 w-1/2" />
              <LoadingSkeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
