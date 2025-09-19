"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
// Supabase temporarily disabled - using API calls instead
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LocationInput } from "@/components/location-input"
import Link from "next/link"

interface Event {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  category: string
  seats: number
  image_url?: string
  host_whatsapp?: string
}

interface EditEventFormProps {
  event: Event
}

export function EditEventForm({ event }: EditEventFormProps) {
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    category: event.category,
    seats: event.seats,
    image_url: event.image_url || "",
    host_whatsapp: event.host_whatsapp || "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  // const supabase = createBrowserClient() // Temporarily disabled

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      toast({
        title: "Success",
        description: "Event updated successfully!",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event Title</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your event"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <LocationInput
              locationValue={formData.location}
              addressValue=""
              onLocationSelect={(location, address) => handleInputChange("location", location)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pet Meet">Pet Meet</SelectItem>
                  <SelectItem value="Games Night">Games Night</SelectItem>
                  <SelectItem value="Recreation">Recreation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats">Max Attendees</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max="100"
                value={formData.seats}
                onChange={(e) => handleInputChange("seats", Number.parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Event Image URL (Optional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => handleInputChange("image_url", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="host_whatsapp">WhatsApp Number (Optional)</Label>
            <Input
              id="host_whatsapp"
              value={formData.host_whatsapp}
              onChange={(e) => handleInputChange("host_whatsapp", e.target.value)}
              placeholder="e.g., +1234567890"
            />
            <p className="text-sm text-muted-foreground">
              Include country code. This will be used for attendees to contact you.
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Event"}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
