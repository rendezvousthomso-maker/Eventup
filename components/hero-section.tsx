"use client"

// import { Search } from "lucide-react" // Currently unused
import { useRouter } from "next/navigation"
import { useLoading } from "@/components/ui/loading-provider"
import { Loader2 } from "lucide-react"

interface HeroSectionProps {
  pendingEventsCount: number
  isAuthenticated: boolean
}

export function HeroSection({ pendingEventsCount, isAuthenticated }: HeroSectionProps) {
  const router = useRouter()
  const { isLoading: globalLoading, setLoading } = useLoading()
  
  const isDisabled = isAuthenticated && pendingEventsCount >= 2

  const handleHostEventClick = () => {
    if (isDisabled) return
    setLoading("host-event", true)
    router.push("/create-event")
    setTimeout(() => setLoading("host-event", false), 500)
  }

  return (
    <section className="relative bg-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-[#222222] mb-6 text-balance leading-tight">
            Discover & Host Events in{" "}
            <span className="text-transparent bg-gradient-to-r from-[#e61e4d] to-[#e31c5f] bg-clip-text">
              Bangalore
            </span>
          </h1>
          <p className="text-xl text-[#717171] mb-12 text-pretty max-w-2xl mx-auto leading-relaxed">
            Connect with your community through amazing events. From pet meetups to game nights, find your tribe and
            create unforgettable memories.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={handleHostEventClick}
            disabled={globalLoading || isDisabled}
            className="primary py-4 px-8 rounded-lg text-base transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center mx-auto"
            style={{
              background: "linear-gradient(135deg, #e61e4d 0%, #e31c5f 100%)",
              color: "#ffffff",
              border: "none",
              cursor: (globalLoading || isDisabled) ? "not-allowed" : "pointer",
            }}
          >
            {globalLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Host an Event
          </button>
          {isDisabled && (
            <p className="text-sm text-amber-600 mt-3 font-medium">
              You have {pendingEventsCount} events pending approval. Please wait for admin approval before creating more events.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
