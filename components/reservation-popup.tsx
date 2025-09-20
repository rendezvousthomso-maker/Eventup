"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Minus, Plus, Users } from "lucide-react"
// import { useSession } from "next-auth/react" // Currently unused
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { openWhatsApp } from "@/lib/whatsapp"

interface Event {
  id: string
  name: string
  date: string
  time: string
  seats: number
  host_whatsapp: string
  host_name: string
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
  const router = useRouter()

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
    if (numberOfPeople < event.seats) {
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
      <DialogContent className="sm:max-w-md w-[95vw] max-w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Reserve Your Spot
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{event.name}</h3>
            <p className="text-muted-foreground">
              {new Date(event.date).toLocaleDateString()} at {event.time}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{event.seats} seats available</p>
          </div>

          {/* People Selection */}
          <div className="space-y-3">
            <Label htmlFor="people">Number of People</Label>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementPeople}
                disabled={numberOfPeople <= 1}
                className="h-10 w-10 bg-transparent"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 min-w-[100px] justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-semibold">{numberOfPeople}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={incrementPeople}
                disabled={numberOfPeople >= event.seats}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {numberOfPeople >= event.seats && (
              <p className="text-sm text-amber-600 text-center">Maximum seats reached</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            
            <Button
              onClick={handleReservation}
              className="primary"
              disabled={isLoading}
            >
              {isLoading ? "Reserving..." : "Confirm Reservation"}
            </Button>
            {/* <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent order-2 sm:order-1"
              disabled={isLoading}
            >
              Cancel
            </Button> */}
          </div>

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
