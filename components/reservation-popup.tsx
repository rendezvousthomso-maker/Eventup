"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, MapPin, Minus, Plus, Share2, Users, Loader2 } from "lucide-react"
// import { useSession } from "next-auth/react" // Currently unused
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { openWhatsApp } from "@/lib/whatsapp"
import Image from "next/image"
// EventImage interface for Vercel Blob
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
  date: string
  time: string
  location: string
  maps_link?: string
  seats: number
  seats_available?: number
  seats_confirmed?: number
  host_whatsapp: string
  host_name: string
  image_url?: string
}

interface ReservationPopupProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  user: {
    id?: string
    name?: string | null
    email?: string | null
  } | null
}

export function ReservationPopup({ event, isOpen, onClose, user }: ReservationPopupProps) {
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [eventImages, setEventImages] = useState<EventImage[]>([])
  const router = useRouter()

  useEffect(() => {
    if (event) {
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
    }
  }, [event?.id])

  if (!event) return null

  const handleReservation = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    try {
      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          numberOfPeople,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          toast({
            title: "Already Reserved",
            description: "You have already reserved this event.",
            variant: "destructive",
          })
        } else {
          throw new Error(error.error || 'Failed to create booking')
        }
        return
      }

      openWhatsApp({
        phoneNumber: event.host_whatsapp,
        eventName: event.name,
        eventDate: event.date,
        hostName: event.host_name,
        numberOfPeople,
      })

      // Show success toast
      toast({
        title: "Reservation Confirmed!",
        description: `You've reserved ${numberOfPeople} ${numberOfPeople === 1 ? "spot" : "spots"} for ${event.name}. WhatsApp opened to contact the host.`,
      })

      onClose()
    } catch (error) {
      console.error("Reservation error:", error)
      toast({
        title: "Reservation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const incrementPeople = () => {
    const availableSeats = event.seats_available !== undefined ? event.seats_available : event.seats
    if (numberOfPeople < availableSeats) {
      setNumberOfPeople((prev) => prev + 1)
    }
  }

  const decrementPeople = () => {
    if (numberOfPeople > 1) {
      setNumberOfPeople((prev) => prev - 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-w-[95vw] sm:w-full p-0 gap-0 flex flex-col max-h-[calc(90vh-2rem)]">
        {/* Image Section */}
        <div className="relative w-full h-[200px] sm:h-[300px] rounded-t-lg overflow-hidden">
          <Image
            src={(() => {
              const primaryImage = eventImages.length > 0 ? eventImages[0] : null
              return primaryImage?.publicUrl || event.image_url || "/placeholder.svg?height=300&width=600&query=event"
            })()}
            alt={event.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Fixed Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
                <div className="text-lg font-semibold text-muted-foreground">
                  Host : {event.host_name}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => {
                  // Use the events route for sharing
                  const url = `${window.location.origin}/events/${event.id}`
                  navigator.clipboard.writeText(url)
                  toast({
                    title: "Link Copied!",
                    description: "Event link has been copied to your clipboard.",
                  })
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 space-y-6 min-h-[200px]">
            {/* Event Stats */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Spots</span>
                <span className="font-semibold">{event.seats}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available Spots</span>
                <span className="font-semibold text-green-600">{event.seats_available !== undefined ? event.seats_available : event.seats} left</span>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-muted-foreground">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">Location</p>
                  {event.maps_link ? (
                    <a 
                      href={event.maps_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {event.location}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">{event.location}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">About this Event</p>
                <p className="text-muted-foreground text-sm">{event.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section */}
        <div className="border-t p-6 space-y-4 mt-auto flex-shrink-0">
          {/* People Selection */}
          <div className="space-y-3">
            <Label className="text-base">Number of Guests</Label>
            <div className="flex items-center justify-between gap-4 bg-muted/50 p-3 rounded-lg">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementPeople}
                disabled={numberOfPeople <= 1}
                className="h-10 w-10"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-semibold">{numberOfPeople}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={incrementPeople}
                disabled={numberOfPeople >= (event.seats_available !== undefined ? event.seats_available : event.seats)}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {numberOfPeople >= (event.seats_available !== undefined ? event.seats_available : event.seats) && (
              <p className="text-sm text-amber-600">Maximum seats reached</p>
            )}
          </div>

          {/* Reservation Button */}
          <Button
            onClick={handleReservation}
            className="w-full h-12 text-lg primary"
            disabled={isLoading || (event.seats_available !== undefined && event.seats_available <= 0)}
          >
            {isLoading ? "Reserving..." : 
             (event.seats_available !== undefined && event.seats_available <= 0) ? "No seats available" : 
             "Confirm Reservation"}
          </Button>

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              You&apos;ll be redirected to sign in to complete your reservation
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
