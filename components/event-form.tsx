"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, MapPinIcon, UsersIcon, PhoneIcon, ImageIcon, CheckCircleIcon, Loader2 } from "lucide-react"
import { LocationInput } from "@/components/location-input"
import { ImageUpload } from "@/components/image-upload"
import { validateForm, commonValidations, type ValidationRules } from "@/components/form-validation"

interface EventFormData {
  name: string
  date: string
  time: string
  location: string
  mapsLink: string
  seats: number
  description: string
  whatsapp: string
  imageUrl: string | null
  category: string
}

const validationRules: ValidationRules = {
  name: { required: true, minLength: 3, maxLength: 100 },
  date: commonValidations.date,
  time: { required: true },
  location: { required: true, minLength: 2, maxLength: 100 },
  mapsLink: { required: false },
  seats: commonValidations.positiveNumber,
  description: { required: true, minLength: 10, maxLength: 1000 },
  whatsapp: commonValidations.phone,
  category: { required: true },
}

export function EventForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  
  // Generate a temporary eventId for image uploads during creation
  const tempEventId = useMemo(() => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, [])
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: "",
    time: "",
    location: "",
    mapsLink: "",
    seats: 1,
    description: "",
    whatsapp: "",
    imageUrl: null,
    category: "RECREATION",
  })

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newValue = name === "seats" ? Number.parseInt(value) || 1 : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear field error when user selects
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleImageSelect = (file: File | null) => {
    setSelectedImageFile(file)
  }

  const uploadImageIfSelected = async (eventId: string): Promise<string | null> => {
    if (!selectedImageFile) return null

    try {
      const response = await fetch(
        `/api/events/upload?filename=${selectedImageFile.name}&eventId=${eventId}`,
        {
          method: 'POST',
          body: selectedImageFile,
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error('Image upload error:', error)
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleLocationSelect = (location: string, mapsLink: string) => {
    setFormData((prev) => ({
      ...prev,
      location,
      mapsLink,
    }))

    // Clear location/mapsLink errors
    if (errors.location || errors.mapsLink) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.location
        delete newErrors.mapsLink
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)

    // Check authentication
    if (!session?.user) {
      setErrors({ submit: "You must be logged in to create an event" })
      return
    }

    // Validate form
    const validationErrors = validateForm(formData as unknown as Record<string, unknown>, validationRules)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      // First, create the event to get the eventId
      const eventResponse = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          mapsLink: formData.mapsLink,
          seats: formData.seats,
          description: formData.description,
          hostWhatsapp: formData.whatsapp,
          imageUrl: null, // Will be updated after image upload
          category: formData.category,
          hostName: session.user.name || 'Anonymous',
        }),
      })

      if (!eventResponse.ok) {
        const error = await eventResponse.json()
        throw new Error(error.error || 'Failed to create event')
      }

      const createdEvent = await eventResponse.json()

      // Upload image if selected
      let imageUrl: string | null = null
      if (selectedImageFile) {
        imageUrl = await uploadImageIfSelected(createdEvent.id)
        
        // Update event with image URL
        const updateResponse = await fetch(`/api/events/${createdEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            imageUrl: imageUrl,
            hostName: session.user.name || 'Anonymous',
          }),
        })

        if (!updateResponse.ok) {
          console.warn('Failed to update event with image URL')
        }
      }

      setSuccess(true)

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error: unknown) {
      setErrors({ submit: error instanceof Error ? error.message : "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Event Created Successfully!</h2>
              <p className="text-gray-600">Your event has been published and is now visible to attendees.</p>
              <p className="text-sm text-gray-500">Redirecting to events page...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
                  onChange={handleInputChange}
                  placeholder="Enter event name"
                  required
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className={errors.date ? "border-red-500" : ""}
                  />
                  {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className={errors.time ? "border-red-500" : ""}
                  />
                  {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seats" className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    Number of Seats *
                  </Label>
                  <Input
                    id="seats"
                    name="seats"
                    type="number"
                    min="1"
                    value={formData.seats}
                    onChange={handleInputChange}
                    required
                    className={errors.seats ? "border-red-500" : ""}
                  />
                  {errors.seats && <p className="text-sm text-red-500 mt-1">{errors.seats}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PET_MEET">Pet Meet</SelectItem>
                      <SelectItem value="GAMES_NIGHT">Games Night</SelectItem>
                      <SelectItem value="RECREATION">Recreation</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
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
                onLocationSelect={handleLocationSelect}
                locationValue={formData.location}
                mapsLinkValue={formData.mapsLink}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
              {errors.mapsLink && <p className="text-sm text-red-500 mt-1">{errors.mapsLink}</p>}
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
                  onChange={handleInputChange}
                  placeholder="Describe your event..."
                  rows={6}
                  required
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
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
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  required
                  className={errors.whatsapp ? "border-red-500" : ""}
                />
                {errors.whatsapp && <p className="text-sm text-red-500 mt-1">{errors.whatsapp}</p>}
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
              <ImageUpload onImageSelect={handleImageSelect} selectedImage={selectedImageFile} disabled={isLoading} />
            </CardContent>
          </Card>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button - Pinned at bottom on mobile */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:mx-0">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full lg:w-auto bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8 py-3"
        >
          {isLoading ? "Creating Event..." : "Create Event"}
        </Button>
      </div>
    </form>
  )
}
