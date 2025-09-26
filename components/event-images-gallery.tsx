"use client"

import { useState, useEffect } from "react"
// EventImage interface for Vercel Blob
interface EventImage {
  key: string
  filename: string
  publicUrl: string
  lastModified: Date
  size: number
  originalName: string
}
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface EventImagesGalleryProps {
  eventId: string
  className?: string
}

export function EventImagesGallery({ eventId, className }: EventImagesGalleryProps) {
  const [images, setImages] = useState<EventImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/events/${eventId}/images`)
        if (response.ok) {
          const data = await response.json()
          setImages(data.images || [])
        }
      } catch (error) {
        console.error('Failed to load event images:', error)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [eventId])

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500">No images available for this event</p>
      </div>
    )
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={className}>
      {/* Main image grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Dialog key={image.key} open={isDialogOpen && selectedImageIndex === index} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div 
                className="relative aspect-square cursor-pointer hover:opacity-90 transition-opacity rounded-lg overflow-hidden group"
                onClick={() => {
                  setSelectedImageIndex(index)
                  setIsDialogOpen(true)
                }}
              >
                <Image
                  src={image.publicUrl}
                  alt={image.originalName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium">
                    View Full Size
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full h-[80vh] p-0 bg-black border-0">
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={images[selectedImageIndex]?.publicUrl || ''}
                  alt={images[selectedImageIndex]?.originalName || ''}
                  fill
                  className="object-contain"
                />
                
                {/* Navigation buttons */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
                
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
                
                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
      
      {/* Image count */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {images.length} image{images.length !== 1 ? 's' : ''} available
      </div>
    </div>
  )
}
