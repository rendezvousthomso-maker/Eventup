"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Heart, Star } from "lucide-react"
import { fetchEventImages, getPrimaryEventImage, type EventImage } from "@/lib/event-images"

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

interface EventCardProps {
  event: Event
  onReserveClick: (event: Event) => void
}

export function EventCard({ event, onReserveClick }: EventCardProps) {
  const [eventImages, setEventImages] = useState<EventImage[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const loadEventImages = async () => {
      try {
        const images = await fetchEventImages(event.id)
        setEventImages(images)
      } catch (error) {
        console.error('Failed to load event images:', error)
      }
    }

    loadEventImages()
  }, [event.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Pet Meet":
        return "bg-pink-100 text-pink-700"
      case "Games Night":
        return "bg-blue-100 text-blue-700"
      case "Recreation":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border rounded-md"
      onClick={() => onReserveClick(event)}
    >
      <div className="relative">
        {/* Image Container */}
        <div className="relative h-64 w-full overflow-hidden rounded-md">
          <Image
            src={(() => {
              const primaryImage = getPrimaryEventImage(eventImages)
              return primaryImage?.publicUrl || event.image_url || "/placeholder.svg?height=256&width=400&query=event"
            })()}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={() => setImageLoaded(true)}
          />
          {/* Favorite Heart Button */}
          <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200">
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
          </button>
          {/* Category Badge */}
          <div className="bg-white rounded-full absolute top-3 left-3">
            <span className={`inline-block px-3 py-1 text-xs font-medium bg-white rounded-full border border-gray-200 shadow`}>
              {event.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 py-3">
          {/* Location and Rating Row */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold truncate pr-2 text-foreground">{event.name} </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-4 w-4 fill-current text-gray-800" />
              <span className="text-sm font-medium text-gray-800">4.9</span>
            </div>
          </div>

          {/* Event Name and Host */}
          <p className="text-sm mb-1 truncate text-muted-foreground">
          {event.location} • Hosted by {event.host_name}
          </p>

          {/* Date and Time */}
          <p className="text-sm mb-2 text-muted-foreground">
            {formatDate(event.date)} • {formatTime(event.time)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{event.seats} seats available</span>
            </div>
            <Button
              size="sm"
              className="primary"
              onClick={(e) => {
                e.stopPropagation()
                onReserveClick(event)
              }}
            >
              Reserve
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
