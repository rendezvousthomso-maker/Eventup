"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Check, X, Clock } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface BookingRequest {
  id: string
  numberOfPeople: number
  status: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  event: {
    id: string
    name: string
    date: string
    time: string
    location: string
    category: string
  }
}

interface ReservationRequestsSectionProps {
  userId: string
}

export function ReservationRequestsSection({ userId }: ReservationRequestsSectionProps) {
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRequests = useCallback(async () => {
    try {
      // First get all events by this host
      const eventsResponse = await fetch(`/api/events?hostId=${userId}`)
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events')
      }
      const events = await eventsResponse.json()
      
      // Extract all bookings from events and filter pending ones
      const allBookings: BookingRequest[] = []
      events.forEach((event: {
        id: string
        name: string
        date: string
        time: string
        location: string
        category: string
        bookings: Array<{
          id: string
          status: string
          number_of_people: number
          created_at: string
          user: {
            id: string
            name: string
            email: string
          }
        }>
      }) => {
        event.bookings.forEach((booking) => {
          if (booking.status === 'pending') {
            allBookings.push({
              id: booking.id,
              numberOfPeople: booking.number_of_people,
              status: booking.status,
              createdAt: booking.created_at,
              user: booking.user,
              event: {
                id: event.id,
                name: event.name,
                date: event.date,
                time: event.time,
                location: event.location,
                category: event.category
              }
            })
          }
        })
      })
      
      // Sort by creation date (newest first)
      allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setRequests(allBookings)
    } catch (error) {
      console.error("Error fetching reservation requests:", error)
      toast({
        title: "Error",
        description: "Failed to load reservation requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [userId, toast])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleStatusUpdate = async (bookingId: string, newStatus: 'CONFIRMED' | 'CANCELLED') => {
    setProcessingId(bookingId)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      // Remove the request from the list since it's no longer pending
      setRequests(requests.filter(request => request.id !== bookingId))
      
      toast({
        title: "Success",
        description: `Booking ${newStatus.toLowerCase()} successfully.`,
      })
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
          <p className="text-muted-foreground">
            You&apos;ll see reservation requests for your events here when people book them.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => {
        const eventDateTime = new Date(`${request.event.date}T${request.event.time}`)
        const requestDate = new Date(request.createdAt)

        return (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{request.event.name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {format(eventDateTime, "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {request.event.location}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="ml-4">
                  {request.event.category}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.user.name || request.user.email}</p>
                    <p className="text-sm text-muted-foreground">{request.user.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Requested on {format(requestDate, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm font-medium">
                      <Users className="mr-1 h-4 w-4" />
                      {request.numberOfPeople} {request.numberOfPeople === 1 ? 'person' : 'people'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleStatusUpdate(request.id, 'CONFIRMED')}
                  disabled={processingId === request.id}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(request.id, 'CANCELLED')}
                  disabled={processingId === request.id}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
