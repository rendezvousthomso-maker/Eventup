"use client"

import type React from "react"
import type { PutBlobResult } from '@vercel/blob';

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageIcon, UploadIcon, XIcon, LoaderIcon } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  selectedImage: File | null
  onUploadComplete?: (blob: PutBlobResult) => void
  eventId?: string
  disabled?: boolean
}

export function ImageUpload({ 
  onImageSelect, 
  selectedImage, 
  onUploadComplete, 
  eventId,
  disabled = false 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedBlob, setUploadedBlob] = useState<PutBlobResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB")
      return
    }

    onImageSelect(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveImage = () => {
    onImageSelect(null)
    setPreview(null)
    setUploadedBlob(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleUpload = async () => {
    if (!selectedImage || !eventId) return

    setUploading(true)
    try {
      const response = await fetch(
        `/api/events/upload?filename=${selectedImage.name}&eventId=${eventId}`,
        {
          method: 'POST',
          body: selectedImage,
        },
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const blob = await response.json()
      setUploadedBlob(blob)
      onUploadComplete?.(blob)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Event Image (Optional)</Label>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
            <img src={preview || "/placeholder.svg"} alt="Event preview" className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={disabled || uploading}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-600">
              {selectedImage?.name} ({Math.round((selectedImage?.size || 0) / 1024)}KB)
            </p>
            {eventId && !uploadedBlob && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={uploading || disabled}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Image'
                )}
              </Button>
            )}
            {uploadedBlob && (
              <p className="text-sm text-green-600">
                ✅ Image uploaded successfully
              </p>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragEnter={disabled ? undefined : handleDrag}
          onDragLeave={disabled ? undefined : handleDrag}
          onDragOver={disabled ? undefined : handleDrag}
          onDrop={disabled ? undefined : handleDrop}
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Drag and drop an image here, or click to select</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              className="flex items-center gap-2 bg-transparent"
              disabled={disabled}
            >
              <UploadIcon className="h-4 w-4" />
              Choose Image
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
        </div>
      )}

      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleFileInputChange} 
        className="hidden" 
        disabled={disabled}
      />
    </div>
  )
}
