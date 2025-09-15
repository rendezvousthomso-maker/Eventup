"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, X, Users, Clock, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Booking {
  id: string
  status: "pending" | "approved" | "rejected"
  number_of_people: number
  created_at: string
  user_id: string
  profiles: {
    full_name: string | null
    email: string
  } | null
}

interface Event {
  id: string
  title: string
  max_attendees: number
}

interface ViewAttendeesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string | null
}

export function ViewAttendeesDialog({ open, onOpenChange, eventId }: ViewAttendeesDialogProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (eventId && open) {
      fetchEventAndBookings()
    }
  }, [eventId, open])

  const fetchEventAndBookings = async () => {
    if (!eventId) return

    setLoading(true)
    try {
      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id, title, max_attendees")
        .eq("id", eventId)
        .single()

      if (eventError) throw eventError
      setEvent(eventData)

      // Fetch bookings with user profiles
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          number_of_people,
          created_at,
          user_id,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })

      if (bookingsError) throw bookingsError
      setBookings(bookingsData || [])
    } catch (error) {
      console.error("Error fetching attendees:", error)
      toast({
        title: "Error",
        description: "Failed to load attendees. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)

      if (error) throw error

      setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)))

      toast({
        title: "Success",
        description: `Booking ${status} successfully.`,
      })
    } catch (error) {
      console.error("Error updating booking:", error)
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getBookingStats = () => {
    const pending = bookings.filter((b) => b.status === "pending")
    const approved = bookings.filter((b) => b.status === "approved")
    const totalApprovedSeats = approved.reduce((sum, b) => sum + b.number_of_people, 0)
    const seatsLeft = event ? event.max_attendees - totalApprovedSeats : 0

    return { pending: pending.length, approved: approved.length, totalApprovedSeats, seatsLeft }
  }

  const stats = getBookingStats()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {event?.title} - Attendees
          </DialogTitle>
          <DialogDescription>Manage booking requests and view confirmed attendees for your event.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalApprovedSeats}</div>
                  <div className="text-sm text-muted-foreground">Confirmed Seats</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{stats.seatsLeft}</div>
                  <div className="text-sm text-muted-foreground">Seats Left</div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Bookings List */}
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground">
                    When people book your event, they'll appear here for you to approve.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Booking Requests</h3>

                {/* Pending Requests */}
                {bookings.filter((b) => b.status === "pending").length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Pending Approval ({bookings.filter((b) => b.status === "pending").length})
                    </h4>
                    {bookings
                      .filter((booking) => booking.status === "pending")
                      .map((booking) => (
                        <Card key={booking.id} className="border-yellow-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <p className="font-medium">{booking.profiles?.full_name || "Anonymous User"}</p>
                                    <p className="text-sm text-muted-foreground">{booking.profiles?.email}</p>
                                  </div>
                                  <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Requested {booking.number_of_people} seat{booking.number_of_people > 1 ? "s" : ""} •
                                  {new Date(booking.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => updateBookingStatus(booking.id, "approved")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateBookingStatus(booking.id, "rejected")}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}

                {/* Approved Attendees */}
                {bookings.filter((b) => b.status === "approved").length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      Confirmed Attendees ({bookings.filter((b) => b.status === "approved").length})
                    </h4>
                    {bookings
                      .filter((booking) => booking.status === "approved")
                      .map((booking) => (
                        <Card key={booking.id} className="border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium">{booking.profiles?.full_name || "Anonymous User"}</p>
                                  <p className="text-sm text-muted-foreground">{booking.profiles?.email}</p>
                                </div>
                                <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.number_of_people} seat{booking.number_of_people > 1 ? "s" : ""}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}

                {/* Rejected Requests */}
                {bookings.filter((b) => b.status === "rejected").length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium flex items-center gap-2 text-red-600">
                      <X className="h-4 w-4" />
                      Rejected ({bookings.filter((b) => b.status === "rejected").length})
                    </h4>
                    {bookings
                      .filter((booking) => booking.status === "rejected")
                      .map((booking) => (
                        <Card key={booking.id} className="border-red-200 opacity-75">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium">{booking.profiles?.full_name || "Anonymous User"}</p>
                                  <p className="text-sm text-muted-foreground">{booking.profiles?.email}</p>
                                </div>
                                <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.number_of_people} seat{booking.number_of_people > 1 ? "s" : ""}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
