"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Trash2, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface EventImage {
  key: string
  filename: string
  publicUrl: string
  lastModified: Date
  size: number
  originalName: string
}

interface Event {
  id: string
  name: string
  description: string
  category: string
  date: string
  time: string
  location: string
  maps_link?: string
  seats: number
  seats_available?: number
  seats_confirmed?: number
  host_name: string
  host_whatsapp: string
  image_url?: string
}

interface EventCardProps {
  event: Event
  onReserveClick: (event: Event) => void
  isAdmin?: boolean
  onDelete?: (eventId: string) => void
}

export function EventCard({ event, onReserveClick, isAdmin = false, onDelete }: EventCardProps) {
  const [eventImages, setEventImages] = useState<EventImage[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadEventImages = async () => {
      try {
        const response = await fetch(`/api/events/${event.id}/images`)
        if (response.ok) {
          const data = await response.json()
          setEventImages(data.images || [])
        }
      } catch (error) {
        console.error('Failed to load event images:', error)
      }
    }

    loadEventImages()
  }, [event.id])

  const getPrimaryEventImage = (images: EventImage[]): EventImage | null => {
    if (!images || images.length === 0) return null
    // Return the first image (newest due to sorting in API)
    return images[0]
  }

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      })

      // Call the onDelete callback to update the parent component
      if (onDelete) {
        onDelete(event.id)
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
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
          {/* Category Badge */}
          <div className="bg-white rounded-full absolute top-3 left-3">
            <span className={`inline-block px-3 py-1 text-xs font-medium bg-white rounded-full border border-gray-200 shadow`}>
              {event.category}
            </span>
          </div>
          
          {/* Admin Delete Button */}
          {isAdmin && (
            <button
              onClick={handleDeleteClick}
              className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
              title="Delete event (Admin)"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-3 py-3">
          {/* Location and Event Name Row */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold truncate pr-2 text-foreground">{event.name} </h3>
          </div>

          {/* Event Name and Host */}
          <p className="text-sm mb-1 truncate text-muted-foreground">
            {event.maps_link ? (
              <a 
                href={event.maps_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {event.location}
              </a>
            ) : (
              event.location
            )} • Hosted by {event.host_name}
          </p>

          {/* Date and Time */}
          <p className="text-sm mb-2 text-muted-foreground">
            {formatDate(event.date)} • {formatTime(event.time)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">
                {event.seats_available !== undefined ? event.seats_available : event.seats} seats available
              </span>
            </div>
            <Button
              size="sm"
              className="primary"
              disabled={event.seats_available !== undefined && event.seats_available <= 0}
              onClick={(e) => {
                e.stopPropagation()
                onReserveClick(event)
              }}
            >
              {event.seats_available !== undefined && event.seats_available <= 0 ? "No seats available" : "Reserve"}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.name}"? This action cannot be undone and will permanently remove the event and all its bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
