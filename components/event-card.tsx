"use client"

import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"
import Image from "next/image"

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
    <div className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border">
      <div className="relative">
        {/* Image Container */}
        <div className="relative h-64 w-full overflow-hidden rounded-xl">
          <Image
            src={event.image_url || "/placeholder.svg?height=256&width=400&query=event"}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Favorite Heart Button */}
          <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200">
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
          </button>
          {/* Guest Favorite Badge */}
          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
            Popular
          </div>
        </div>

        {/* Content */}
        <div className="pt-3">
          {/* Location and Rating Row */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold truncate pr-2 text-foreground">{event.location}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-4 w-4 fill-current text-gray-800" />
              <span className="text-sm font-medium text-gray-800">4.9</span>
            </div>
          </div>

          {/* Event Name and Host */}
          <p className="text-sm mb-1 truncate text-muted-foreground">
            {event.name} • Hosted by {event.host_name}
          </p>

          {/* Date and Time */}
          <p className="text-sm mb-2 text-muted-foreground">
            {formatDate(event.date)} • {formatTime(event.time)}
          </p>

          {/* Category Badge */}
          <div className="mb-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)} text-foreground`}
            >
              {event.category}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{event.seats} seats available</span>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-4 py-2 h-auto sm:w-auto w-full sm:ml-0 ml-2"
              onClick={() => onReserveClick(event)}
            >
              Reserve
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
