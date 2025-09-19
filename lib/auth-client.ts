// Client-side authentication utilities
"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (provider?: string) => {
    if (provider) {
      await signIn(provider, { callbackUrl: "/" })
    } else {
      router.push("/auth/login")
    }
  }

  const logout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const loginWithGoogle = async () => {
    await signIn("google", { callbackUrl: "/" })
  }

  const loginWithEmail = async (email: string) => {
    await signIn("email", { email, callbackUrl: "/" })
  }

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    login,
    logout,
    loginWithGoogle,
    loginWithEmail,
  }
}
