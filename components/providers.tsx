"use client"

import React from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toast"
import { LoadingProvider } from "@/components/ui/loading-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LoadingProvider>
        {children}
        <Toaster />
      </LoadingProvider>
    </SessionProvider>
  )
}
