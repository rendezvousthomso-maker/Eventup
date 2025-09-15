"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, UserCheck, X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BookingWithEvent {
  id: string
  status: "pending" | "approved" | "rejected"
  number_of_people: number
  created_at: string
  events: {
    id: string
    title: string
    date: string
    time: string
  }
  profiles: {
    full_name: string | null
    email: string
  } | null
}

interface AllAttendeesSectionProps {
  userId: string
}

export function AllAttendeesSection({ userId }: AllAttendeesSectionProps) {
  const [bookings, setBookings] = useState<BookingWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchAllBookings()
  }, [userId])

  const fetchAllBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          number_of_people,
          created_at,
          events!inner (
            id,
            title,
            date,
            time,
            host_id
          ),
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq("events.host_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setBookings(data || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
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

  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const approvedBookings = bookings.filter((b) => b.status === "approved")
  const rejectedBookings = bookings.filter((b) => b.status === "rejected")

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="mx-auto h-8 w-8 text-yellow-600 mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</div>
            <div className="text-sm text-muted-foreground">Pending Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <UserCheck className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-600">{approvedBookings.length}</div>
            <div className="text-sm text-muted-foreground">Approved Attendees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="mx-auto h-8 w-8 text-primary mb-2" />
            <div className="text-2xl font-bold text-primary">{bookings.length}</div>
            <div className="text-sm text-muted-foreground">Total Requests</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedBookings.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">All booking requests have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            pendingBookings.map((booking) => (
              <Card key={booking.id} className="border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <p className="font-medium">{booking.profiles?.full_name || "Anonymous User"}</p>
                          <p className="text-sm text-muted-foreground">{booking.profiles?.email}</p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">{booking.events.title}</p>
                        <p>
                          {booking.number_of_people} seat{booking.number_of_people > 1 ? "s" : ""} •{" "}
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
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
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No approved attendees</h3>
                <p className="text-muted-foreground">Approved attendees will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            approvedBookings.map((booking) => (
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
                    <div className="text-sm text-muted-foreground text-right">
                      <p className="font-medium">{booking.events.title}</p>
                      <p>
                        {booking.number_of_people} seat{booking.number_of_people > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <X className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rejected requests</h3>
                <p className="text-muted-foreground">Rejected requests will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            rejectedBookings.map((booking) => (
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
                    <div className="text-sm text-muted-foreground text-right">
                      <p className="font-medium">{booking.events.title}</p>
                      <p>
                        {booking.number_of_people} seat{booking.number_of_people > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
