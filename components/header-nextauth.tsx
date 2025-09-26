"use client"

import { Menu, User, LogOut, Settings, Calendar } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const { data: session, status } = useSession()
  const { toast } = useToast()

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

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
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
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/create-event"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              Host an Event
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
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
                        {user.image ? (
                          <img 
                            src={user.image} 
                            alt={user.name || "User"} 
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
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
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/create-event" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Create Event
                      </Link>
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
                      Sign Ik
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button size="sm">Host an Event</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
