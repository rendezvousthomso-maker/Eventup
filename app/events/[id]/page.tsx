"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ReservationPopup } from "@/components/reservation-popup"

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

export default function EventPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch event')
        }
        const data = await response.json()
        setEvent(data)
      } catch (error) {
        console.error("Error fetching event:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!event) {
    return <div>Event not found</div>
  }

  return (
    <ReservationPopup
      event={event}
      isOpen={true}
      onClose={() => window.history.back()}
      user={null} // You might want to handle user session here
    />
  )
}
