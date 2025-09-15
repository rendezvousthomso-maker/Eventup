"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LocationInputProps {
  onLocationSelect: (location: string, address: string) => void
  locationValue: string
  addressValue: string
}

declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

export function LocationInput({ onLocationSelect, locationValue, addressValue }: LocationInputProps) {
  const locationInputRef = useRef<HTMLInputElement>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const [locationAutocomplete, setLocationAutocomplete] = useState<any>(null)
  const [addressAutocomplete, setAddressAutocomplete] = useState<any>(null)
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // Check if we can access the API key (it exists and is not empty)
        const hasKey =
          typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string" &&
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.length > 0
        setHasApiKey(hasKey)
      } catch {
        setHasApiKey(false)
      }
    }

    checkApiKey()
  }, [])

  useEffect(() => {
    if (!hasApiKey) return

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsGoogleMapsLoaded(true)
      return
    }

    // Define the callback function
    window.initGoogleMaps = () => {
      setIsGoogleMapsLoaded(true)
    }

    // Load Google Maps script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    script.onerror = () => {
      console.warn("Failed to load Google Maps API. Check your API key and domain restrictions.")
      setHasApiKey(false)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      delete window.initGoogleMaps
    }
  }, [hasApiKey])

  useEffect(() => {
    if (!isGoogleMapsLoaded || !window.google) return

    // Initialize location autocomplete
    if (locationInputRef.current && !locationAutocomplete) {
      const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current, {
        types: ["establishment", "geocode"],
        fields: ["name", "formatted_address", "geometry"],
      })

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (place && place.name && place.formatted_address) {
          onLocationSelect(place.name, place.formatted_address)
        }
      })

      setLocationAutocomplete(autocomplete)
    }

    // Initialize address autocomplete
    if (addressInputRef.current && !addressAutocomplete) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["address"],
        fields: ["formatted_address"],
      })

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (place && place.formatted_address) {
          onLocationSelect(locationValue, place.formatted_address)
        }
      })

      setAddressAutocomplete(autocomplete)
    }
  }, [isGoogleMapsLoaded, locationAutocomplete, addressAutocomplete, onLocationSelect, locationValue])

  if (!hasApiKey) {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="location-fallback">Venue Name *</Label>
          <Input
            id="location-fallback"
            name="location"
            value={locationValue}
            onChange={(e) => onLocationSelect(e.target.value, addressValue)}
            placeholder="Enter venue name"
            required
          />
        </div>
        <div>
          <Label htmlFor="address-fallback">Address *</Label>
          <Input
            id="address-fallback"
            name="address"
            value={addressValue}
            onChange={(e) => onLocationSelect(locationValue, e.target.value)}
            placeholder="Enter full address"
            required
          />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="text-sm text-amber-800">
            <strong>Google Maps autocomplete not available.</strong> To enable location search:
          </p>
          <ol className="text-xs text-amber-700 mt-2 ml-4 list-decimal space-y-1">
            <li>Get a Google Maps API key from Google Cloud Console</li>
            <li>Enable the Places API</li>
            <li>Add domain restrictions for security</li>
            <li>Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in Project Settings</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="location">Venue Name *</Label>
        <Input
          ref={locationInputRef}
          id="location"
          name="location"
          value={locationValue}
          onChange={(e) => onLocationSelect(e.target.value, addressValue)}
          placeholder="Search for venue name..."
          required
        />
      </div>
      <div>
        <Label htmlFor="address">Address *</Label>
        <Input
          ref={addressInputRef}
          id="address"
          name="address"
          value={addressValue}
          onChange={(e) => onLocationSelect(locationValue, e.target.value)}
          placeholder="Search for address..."
          required
        />
      </div>
      {!isGoogleMapsLoaded && hasApiKey && <p className="text-sm text-gray-500">Loading Google Maps autocomplete...</p>}
    </div>
  )
}
