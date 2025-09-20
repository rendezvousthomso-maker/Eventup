"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"

interface LoadingContextType {
  isLoading: boolean
  loadingStates: Record<string, boolean>
  setLoading: (key: string, loading: boolean) => void
  setGlobalLoading: (loading: boolean) => void
  setPageLoading: (key: string, loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [globalLoading, setGlobalLoading] = useState(false)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [pageLoadingStates, setPageLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }, [])

  const setPageLoading = useCallback((key: string, loading: boolean) => {
    setPageLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }, [])

  const isLoading = globalLoading || Object.values(loadingStates).some(Boolean) || Object.values(pageLoadingStates).some(Boolean)

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingStates: { ...loadingStates, ...pageLoadingStates },
        setLoading,
        setGlobalLoading,
        setPageLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}
