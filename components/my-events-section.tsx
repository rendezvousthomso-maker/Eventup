"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Edit, Trash2, Eye } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { DeleteEventDialog } from "@/components/delete-event-dialog"
import { ViewAttendeesDialog } from "@/components/view-attendees-dialog"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  max_attendees: number
  image_url?: string
  created_at: string
}

interface EventWithBookings extends Event {
  bookings: Array<{
    id: string
    status: string
    number_of_people: number
  }>
}

interface MyEventsSectionProps {
  userId: string
}

export function MyEventsSection({ userId }: MyEventsSectionProps) {
  const [events, setEvents] = useState<EventWithBookings[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null)
  const [viewAttendeesEventId, setViewAttendeesEventId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`/api/events?hostId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const eventsData = await response.json()
      setEvents(eventsData || [])
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load your events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [userId, toast])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      setEvents(events.filter((event) => event.id !== eventId))
      toast({
        title: "Success",
        description: "Event deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    }
    setDeleteEventId(null)
  }

  const getSeatsLeft = (event: EventWithBookings) => {
    const approvedBookings = event.bookings.filter((booking) => booking.status === "confirmed")
    const totalBooked = approvedBookings.reduce((sum, booking) => sum + booking.number_of_people, 0)
    return event.max_attendees - totalBooked
  }

  const getPendingRequests = (event: EventWithBookings) => {
    return event.bookings.filter((booking) => booking.status === "pending").length
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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

  if (events.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by creating your first event to connect with your community.
          </p>
          <Link href="/create-event">
            <Button>Create Your First Event</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const seatsLeft = getSeatsLeft(event)
          const pendingRequests = getPendingRequests(event)
          const eventDate = new Date(`${event.date}T${event.time}`)
          const isUpcoming = eventDate > new Date()

          return (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <Badge variant={isUpcoming ? "default" : "secondary"} className="mt-2">
                      {event.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(eventDate, "MMM d, yyyy 'at' h:mm a")}
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {seatsLeft} seats left
                  </div>
                  {pendingRequests > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {pendingRequests} pending
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewAttendeesEventId(event.id)}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Attendees
                </Button>

                <Link href={`/edit-event/${event.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteEventId(event.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <DeleteEventDialog
        open={deleteEventId !== null}
        onOpenChange={(open) => !open && setDeleteEventId(null)}
        onConfirm={() => deleteEventId && handleDeleteEvent(deleteEventId)}
        eventTitle={events.find((e) => e.id === deleteEventId)?.title || ""}
      />

      <ViewAttendeesDialog
        open={viewAttendeesEventId !== null}
        onOpenChange={(open) => !open && setViewAttendeesEventId(null)}
        eventId={viewAttendeesEventId}
      />
    </>
  )
}
