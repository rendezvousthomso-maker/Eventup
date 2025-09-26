"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Calendar, Users, BarChart3, Settings, Menu, Home, Plus, ClipboardList, UserCheck, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLoading } from "@/components/ui/loading-provider"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "My Events", href: "/dashboard/events", icon: Calendar },
  { name: "Reservations", href: "/dashboard/reservations", icon: ClipboardList },
  { name: "My Bookings", href: "/dashboard/my-bookings", icon: UserCheck },
  { name: "Attendees", href: "/dashboard/attendees", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [navigating, setNavigating] = useState<string | null>(null)
  const { isLoading: globalLoading, setPageLoading } = useLoading()

  const handleNavigation = (href: string) => {
    if (href === pathname) return
    
    setNavigating(href)
    router.push(href)
    
    // Clear navigation state after a short delay
    setTimeout(() => {
      setNavigating(null)
    }, 500)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-sidebar-foreground" />
          <span className="text-lg font-bold text-sidebar-foreground">EventHub</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isLoading = navigating === item.href
          
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                isLoading && "opacity-75"
              )}
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-5 w-5 flex-shrink-0 animate-spin" />
              ) : (
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              )}
              {item.name}
              {isLoading && <span className="ml-2 text-xs opacity-75">Loading...</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button 
          onClick={() => {
            setPageLoading("host-event", true)
            router.push("/create-event")
          }}
          className=" primary w-full"
        >
          <Plus className=" h-4 w-4" />
          Create Event
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6" />
          <span className="text-lg font-bold">EventHub</span>
        </div>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 pt-20 lg:pt-8 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
