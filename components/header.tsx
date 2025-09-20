"use client"

import { Menu, User, LogOut, Settings, Calendar } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useLoading } from "@/components/ui/loading-provider"
import { PageSkeletonLoader } from "@/components/ui/page-skeleton-loader"
import { Loader2 } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const { isLoading: globalLoading, setPageLoading } = useLoading()
  const router = useRouter()

  const user = session?.user
  const loading = status === "loading"

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" })
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDiscoverClick = () => {
    router.push("/#events")
  }

  const handleHostEventClick = () => {
    setPageLoading("host-event", true)
    router.push("/create-event")
  }

  const handleDashboardClick = () => {
    setPageLoading("dashboard", true)
    router.push("/dashboard")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm relative">
      {/* Global Loading Indicator */}
      {globalLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-200 overflow-hidden">
          <div className="h-full bg-blue-600 animate-pulse"></div>
        </div>
      )}
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #e61e4d 0%, #e31c5f 100%)" }}
          >
            <span className="font-bold text-lg" style={{ color: "#ffffff" }}>
              E
            </span>
          </div>
          <span className="text-xl font-bold text-[#222222] hidden sm:block">eventhub</span>
        </Link>

        <nav className="hidden md:flex items-center">
          <div className="flex items-center bg-white border border-gray-300 rounded-full p-1 shadow-sm">
            <button
              onClick={handleDiscoverClick}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              Discover
            </button>
            <button
              onClick={handleHostEventClick}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              Host an Event
            </button>
            {user && (
              <button
                onClick={handleDashboardClick}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </button>
            )}
          </div>
        </nav>

        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 border border-gray-300 rounded-full py-2 px-3 hover:shadow-md transition-shadow">
                      <Menu className="h-4 w-4 text-gray-600" />
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {user.name || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDashboardClick} className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleHostEventClick} className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Create Event
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Skeleton Loader for page navigation */}
      <PageSkeletonLoader loadingKeys={["dashboard", "host-event"]} />
    </header>
  )
}
