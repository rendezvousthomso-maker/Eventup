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
import { ImageUploadR2 } from "@/components/image-upload-r2"
import { CalendarIcon, MapPinIcon, PhoneIcon, ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  maps_link?: string
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
    maps_link: event.maps_link || "",
    category: event.category,
    seats: event.seats,
    image_url: event.image_url || "",
    host_whatsapp: event.host_whatsapp || "",
  })
  const [loading, setLoading] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  // const supabase = createBrowserClient() // Temporarily disabled

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload image if selected
      let imageUrl: string | null = null
      if (selectedImageFile) {
        imageUrl = await uploadImageIfSelected(event.id)
      }

      // Prepare update data
      const updateData = {
        ...formData,
        image_url: imageUrl || formData.image_url, // Use new image URL if uploaded, otherwise keep existing
      }

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
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
        description: error instanceof Error ? error.message : "Failed to update event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLocationSelect = (location: string, mapsLink: string) => {
    setFormData((prev) => ({ ...prev, location, maps_link: mapsLink }))
  }

  const handleImageSelect = (file: File | null) => {
    setSelectedImageFile(file)
  }

  const uploadImageIfSelected = async (eventId: string): Promise<string | null> => {
    if (!selectedImageFile) return null

    try {
      // Step 1: Request pre-signed URL from backend
      const presignedResponse = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedImageFile.name,
          contentType: selectedImageFile.type,
          eventId: eventId
        }),
      })

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json()
        throw new Error(error.error || 'Failed to get upload URL')
      }

      const { presignedUrl, publicUrl } = await presignedResponse.json()

      // Step 2: Upload directly to R2 using pre-signed URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: selectedImageFile,
        headers: {
          'Content-Type': selectedImageFile.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to storage')
      }

      return publicUrl
    } catch (error) {
      console.error('Image upload error:', error)
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Desktop: 2-column layout, Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PET_MEET">Pet Meet</SelectItem>
                      <SelectItem value="GAMES_NIGHT">Games Night</SelectItem>
                      <SelectItem value="RECREATION">Recreation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="seats">Number of Seats *</Label>
                  <Input
                    id="seats"
                    name="seats"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.seats}
                    onChange={(e) => handleInputChange("seats", Number.parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LocationInput
                locationValue={formData.location}
                mapsLinkValue={formData.maps_link}
                onLocationSelect={handleLocationSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="description">Event Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your event..."
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="host_whatsapp">WhatsApp Number *</Label>
                <Input
                  id="host_whatsapp"
                  name="host_whatsapp"
                  value={formData.host_whatsapp}
                  onChange={(e) => handleInputChange("host_whatsapp", e.target.value)}
                  placeholder="+1234567890"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Include country code. This will be used for attendees to contact you.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Event Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploadR2 
                onImageSelect={handleImageSelect} 
                currentImageUrl={formData.image_url}
                disabled={loading} 
              />
              {formData.image_url && !selectedImageFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Current image will be replaced when you upload a new one
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Event"
          )}
        </Button>
        <Link href="/dashboard">
          <Button type="button" variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
