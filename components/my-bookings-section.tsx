"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { LoadingWrapper } from "@/components/ui/loading-wrapper"
import { CardSkeleton } from "@/components/ui/loading-skeleton"

interface MyBooking {
  id: string
  numberOfPeople: number
  status: string
  createdAt: string
  event: {
    id: string
    name: string
    description: string
    category: string
    date: string
    time: string
    location: string
    address: string
    hostName: string
    hostWhatsapp: string
    imageUrl?: string
  }
}

interface MyBookingsSectionProps {
  userId: string
}

export function MyBookingsSection({ userId }: MyBookingsSectionProps) {
  const [bookings, setBookings] = useState<MyBooking[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookings?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      const bookingsData = await response.json()
      setBookings(bookingsData || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to load your bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [userId, toast])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const isEventPast = (date: string, time: string) => {
    const eventDateTime = new Date(`${date}T${time}`)
    return eventDateTime < new Date()
  }


  if (bookings.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven&apos;t made any reservations yet. Start exploring events to book your first one!
          </p>
          <Button asChild>
            <Link href="/">Browse Events</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Filter out bookings with missing event data
  const validBookings = bookings.filter(booking => 
    booking.event && booking.event.id && booking.event.name && booking.event.date && booking.event.time
  )

  if (validBookings.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No valid bookings found</h3>
          <p className="text-muted-foreground mb-4">
            There seems to be an issue with your booking data. Please try refreshing the page.
          </p>
          <Button onClick={() => fetchBookings()}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Separate bookings into upcoming and past
  const upcomingBookings = validBookings.filter(booking => 
    !isEventPast(booking.event.date, booking.event.time) && booking.status !== 'cancelled'
  )
  const pastBookings = validBookings.filter(booking => 
    isEventPast(booking.event.date, booking.event.time) || booking.status === 'cancelled'
  )

  return (
    <LoadingWrapper loading={loading} skeleton={<CardSkeleton count={6} />}>
      <div className="space-y-8">
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingBookings.map((booking) => {
              const eventDateTime = new Date(`${booking.event.date}T${booking.event.time}`)
              const bookingDate = new Date(booking.createdAt)

              return (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{booking.event.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(booking.status)}
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(eventDateTime, "MMM d, yyyy 'at' h:mm a")}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="line-clamp-1">{booking.event.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Booked on {format(bookingDate, "MMM d, yyyy")}
                    </div>

                    {booking.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          Your booking is pending approval from the host. You&apos;ll be notified once it&apos;s confirmed.
                        </p>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          Your booking is confirmed! Contact the host for more details.
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Host: {booking.event.hostName} • {booking.event.hostWhatsapp}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastBookings.map((booking) => {
              const eventDateTime = new Date(`${booking.event.date}T${booking.event.time}`)
              const bookingDate = new Date(booking.createdAt)

              return (
                <Card key={booking.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{booking.event.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusIcon(booking.status)}
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(eventDateTime, "MMM d, yyyy 'at' h:mm a")}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="line-clamp-1">{booking.event.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Booked on {format(bookingDate, "MMM d, yyyy")}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      </div>
    </LoadingWrapper>
  )
}
