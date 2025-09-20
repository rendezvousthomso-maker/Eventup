"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LocationInputProps {
  onLocationSelect: (location: string, mapsLink: string) => void
  locationValue: string
  mapsLinkValue: string
}

export function LocationInput({ onLocationSelect, locationValue, mapsLinkValue }: LocationInputProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="location">Venue Name *</Label>
        <Input
          id="location"
          name="location"
          value={locationValue}
          onChange={(e) => onLocationSelect(e.target.value, mapsLinkValue)}
          placeholder="Enter venue name"
          required
        />
      </div>
      <div>
        <Label htmlFor="maps-link">Google Maps Link</Label>
        <Input
          id="maps-link"
          name="mapsLink"
          value={mapsLinkValue}
          onChange={(e) => onLocationSelect(locationValue, e.target.value)}
          placeholder="https://www.google.com/maps/place/..."
        />
      </div>
    </div>
  )
}
