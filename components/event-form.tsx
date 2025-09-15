"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, MapPinIcon, UsersIcon, PhoneIcon, ImageIcon, CheckCircleIcon } from "lucide-react"
import { LocationInput } from "@/components/location-input"
import { ImageUpload } from "@/components/image-upload"
import { validateForm, commonValidations, type ValidationRules } from "@/components/form-validation"

interface EventFormData {
  name: string
  date: string
  time: string
  location: string
  address: string
  seats: number
  description: string
  whatsapp: string
  image: File | null
}

const validationRules: ValidationRules = {
  name: { required: true, minLength: 3, maxLength: 100 },
  date: commonValidations.date,
  time: { required: true },
  location: { required: true, minLength: 2, maxLength: 100 },
  address: { required: true, minLength: 5, maxLength: 200 },
  seats: commonValidations.positiveNumber,
  description: { required: true, minLength: 10, maxLength: 1000 },
  whatsapp: commonValidations.phone,
}

export function EventForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: "",
    time: "",
    location: "",
    address: "",
    seats: 1,
    description: "",
    whatsapp: "",
    image: null,
  })

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

  const handleImageSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, image: file }))
  }

  const handleLocationSelect = (location: string, address: string) => {
    setFormData((prev) => ({
      ...prev,
      location,
      address,
    }))

    // Clear location/address errors
    if (errors.location || errors.address) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.location
        delete newErrors.address
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccess(false)

    // Validate form
    const validationErrors = validateForm(formData, validationRules)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("You must be logged in to create an event")
      }

      let imageUrl = null

      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(fileName, formData.image)

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("event-images").getPublicUrl(uploadData.path)

        imageUrl = publicUrl
      }

      // Insert event into database
      const { error: insertError } = await supabase.from("events").insert({
        name: formData.name,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        address: formData.address,
        seats: formData.seats,
        description: formData.description,
        host_whatsapp: formData.whatsapp,
        image_url: imageUrl,
        host_id: user.id,
      })

      if (insertError) {
        throw new Error(`Failed to create event: ${insertError.message}`)
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
                addressValue={formData.address}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
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
              <ImageUpload onImageSelect={handleImageSelect} selectedImage={formData.image} />
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
