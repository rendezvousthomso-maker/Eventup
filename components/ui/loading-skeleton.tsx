"use client"

import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  variant?: "default" | "card" | "list" | "form" | "button"
  count?: number
}

export function LoadingSkeleton({ className, variant = "default", count = 1 }: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-muted rounded"
  
  const variantClasses = {
    default: "h-4 w-full",
    card: "h-48 w-full rounded-lg",
    list: "h-16 w-full",
    form: "h-10 w-full rounded-md",
    button: "h-10 w-24 rounded-md"
  }

  const skeletonClasses = cn(baseClasses, variantClasses[variant], className)

  if (count === 1) {
    return <div className={skeletonClasses} />
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={skeletonClasses} />
      ))}
    </>
  )
}

// Predefined skeleton components for common use cases
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </>
  )
}

export function EventCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
          <div className="h-48 bg-muted"></div>
          <div className="p-6 space-y-4">
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
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-muted rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-muted rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-20"></div>
        <div className="h-10 bg-muted rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-10 bg-muted rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-20 bg-muted rounded"></div>
      </div>
      <div className="h-10 bg-muted rounded w-32"></div>
    </div>
  )
}

export function ButtonSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-10 bg-muted rounded w-24 animate-pulse" />
      ))}
    </>
  )
}
