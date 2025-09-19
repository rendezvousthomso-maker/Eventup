"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageIcon, UploadIcon, XIcon, LoaderIcon } from "lucide-react"

interface ImageUploadR2Props {
  onImageUpload: (url: string | null) => void
  currentImageUrl?: string | null
}

export function ImageUploadR2({ onImageUpload, currentImageUrl }: ImageUploadR2Props) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
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

    // Create preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadedUrl(result.url)
      onImageUpload(result.url)

    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
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

  const handleRemoveImage = async () => {
    if (uploadedUrl && uploadedUrl.includes('r2.dev')) {
      // Extract key from URL for deletion
      const key = uploadedUrl.split('/').slice(-2).join('/')
      
      try {
        await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }

    onImageUpload(null)
    setPreview(null)
    setUploadedUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      <Label>Event Image (Optional)</Label>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={preview} 
              alt="Event preview" 
              className="w-full h-full object-cover" 
            />
            
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <LoaderIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}

            {!uploading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {uploadedUrl && !uploading && (
            <p className="text-sm text-green-600 mt-2">
              ✅ Image uploaded successfully
            </p>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:border-gray-400"
          } ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Drag and drop an image here, or click to select
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              className="flex items-center gap-2 bg-transparent"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4" />
                  Choose Image
                </>
              )}
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
        disabled={uploading}
      />
    </div>
  )
}
