"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Calendar, MapPin, Users, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PendingEvent {
  id: string
  name: string
  description: string
  category: string
  date: string
  time: string
  location: string
  seats: number
  host_name: string
  host_whatsapp: string
  image_url?: string
  created_at: string
  status: string
  host: {
    id: string
    name: string
    email: string
  }
}

export function PendingApprovalsClient() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPendingEvents()
  }, [])

  const fetchPendingEvents = async () => {
    try {
      const response = await fetch('/api/admin/events/pending')
      if (!response.ok) throw new Error('Failed to fetch pending events')
      const data = await response.json()
      setPendingEvents(data)
    } catch (error) {
      console.error("Error fetching pending events:", error)
      toast({
        title: "Error",
        description: "Failed to load pending events",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (eventId: string, action: 'approve' | 'reject') => {
    setProcessingId(eventId)
    try {
      const response = await fetch('/api/admin/events/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, action })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process request')
      }

      toast({
        title: "Success",
        description: action === 'approve' 
          ? "Event approved successfully" 
          : "Event rejected and deleted",
      })

      // Remove the event from the list
      setPendingEvents(prev => prev.filter(event => event.id !== eventId))
    } catch (error) {
      console.error("Error processing approval:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process request",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Event Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve events submitted by users</p>
      </div>

      {pendingEvents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">There are no pending events waiting for approval.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{event.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <strong>Host:</strong> {event.host_name} ({event.host.email})
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {event.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">{event.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{event.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{event.seats} seats</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproval(event.id, 'approve')}
                      disabled={processingId === event.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processingId === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleApproval(event.id, 'reject')}
                      disabled={processingId === event.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processingId === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

