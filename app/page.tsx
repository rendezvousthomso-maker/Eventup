"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { EventFilters } from "@/components/event-filters"
import { EventCard } from "@/components/event-card"
import { Footer } from "@/components/footer"
import { ReservationPopup } from "@/components/reservation-popup"
import { EnhancedSearch } from "@/components/enhanced-search"
import { useSession } from "next-auth/react"

interface SearchFilters {
  location: string
  date: string
  category: string | null
}

interface Event {
  id: string
  name: string
  description: string
  category: string
  date: string
  time: string
  location: string
  address: string
  seats: number
  host_name: string
  host_whatsapp: string
  image_url?: string
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: "",
    date: "",
    category: null
  })
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isReservationOpen, setIsReservationOpen] = useState(false)
  
  const { data: session } = useSession()

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    let filtered = events

    // Filter by category (either from search filters or selected category)
    const categoryFilter = searchFilters.category || selectedCategory
    if (categoryFilter) {
      filtered = filtered.filter((event) => event.category === categoryFilter)
    }

    // Filter by location
    if (searchFilters.location) {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
        event.address.toLowerCase().includes(searchFilters.location.toLowerCase())
      )
    }

    // Filter by date
    if (searchFilters.date) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date).toISOString().split('T')[0]
        return eventDate === searchFilters.date
      })
    }

    setFilteredEvents(filtered)
  }, [events, selectedCategory, searchFilters])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    setSearchFilters(prev => ({ ...prev, category: null })) // Clear search category when using filter buttons
  }

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters)
    setSelectedCategory(null) // Clear category filter when using search
  }

  const handleReserveClick = (event: Event) => {
    setSelectedEvent(event)
    setIsReservationOpen(true)
  }

  const handleReservationClose = () => {
    setIsReservationOpen(false)
    setSelectedEvent(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />

      <main className="container mx-auto px-6 py-12">
        <EventFilters selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-64 mb-3"></div>
                <div className="bg-gray-200 rounded h-4 mb-2"></div>
                <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
                <div className="bg-gray-200 rounded h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-[#222222]">
                {(() => {
                  const activeCategory = searchFilters.category || selectedCategory
                  const hasFilters = searchFilters.location || searchFilters.date || activeCategory
                  
                  if (hasFilters) {
                    return "Search Results"
                  }
                  return "Popular events in Bangalore"
                })()}
              </h2>
              <span className="text-[#717171] text-sm">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onReserveClick={handleReserveClick} />
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[#717171] text-lg">No events found for the selected category.</p>
                <p className="text-[#717171] text-sm mt-2">Try selecting a different category or check back later.</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      <ReservationPopup event={selectedEvent} isOpen={isReservationOpen} onClose={handleReservationClose} user={session?.user} />
    </div>
  )
}
