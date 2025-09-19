"use client"

import { useState } from "react"
import { Search, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SearchFilters {
  location: string
  date: string
  category: string | null
}

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  filters: SearchFilters
}

const popularLocations = [
  "Koramangala",
  "Indiranagar", 
  "Whitefield",
  "Electronic City",
  "Hebbal",
  "Marathahalli",
  "JP Nagar",
  "BTM Layout",
  "HSR Layout",
  "Sarjapur Road"
]

export function EnhancedSearch({ onSearch, filters }: EnhancedSearchProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  const handleLocationChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, location: value }))
    setShowLocationSuggestions(value.length > 0)
  }

  const handleLocationSelect = (location: string) => {
    setLocalFilters(prev => ({ ...prev, location }))
    setShowLocationSuggestions(false)
  }

  const handleDateChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, date: value }))
  }

  const handleSearch = () => {
    onSearch(localFilters)
  }

  const filteredLocations = popularLocations.filter(location =>
    location.toLowerCase().includes(localFilters.location.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-white border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 p-2">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-300">
          {/* Location Search */}
          <div className="flex-1 px-6 py-4 relative">
            <Label className="block text-xs font-semibold text-[#222222] mb-1">
              <MapPin className="inline h-3 w-3 mr-1" />
              Where
            </Label>
            <Input
              type="text"
              placeholder="Search locations in Bangalore"
              value={localFilters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => setShowLocationSuggestions(localFilters.location.length > 0)}
              className="w-full text-sm text-[#717171] placeholder-[#717171] bg-transparent border-none outline-none focus:ring-0 p-0 h-auto"
            />
            
            {/* Location Suggestions */}
            {showLocationSuggestions && filteredLocations.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
                {filteredLocations.map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-[#717171] flex items-center gap-2"
                  >
                    <MapPin className="h-3 w-3" />
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex-1 px-6 py-4">
            <Label className="block text-xs font-semibold text-[#222222] mb-1">
              <Calendar className="inline h-3 w-3 mr-1" />
              When
            </Label>
            <Input
              type="date"
              value={localFilters.date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full text-sm text-[#717171] bg-transparent border-none outline-none focus:ring-0 p-0 h-auto"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex-1 px-6 py-4">
            <Label className="block text-xs font-semibold text-[#222222] mb-1">Category</Label>
            <select
              value={localFilters.category || ""}
              onChange={(e) => setLocalFilters(prev => ({ 
                ...prev, 
                category: e.target.value || null 
              }))}
              className="w-full text-sm text-[#717171] bg-transparent border-none outline-none"
            >
              <option value="">All Events</option>
              <option value="Pet Meet">Pet Meet</option>
              <option value="Games Night">Games Night</option>
              <option value="Recreation">Recreation</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-center px-2">
            <Button
              onClick={handleSearch}
              className="p-4 rounded-full transition-all duration-200 hover:scale-105"
              style={{ 
                background: "linear-gradient(135deg, #e61e4d 0%, #e31c5f 100%)", 
                color: "#ffffff" 
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(localFilters.location || localFilters.date || localFilters.category) && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            onClick={() => {
              const clearedFilters = { location: "", date: "", category: null }
              setLocalFilters(clearedFilters)
              onSearch(clearedFilters)
            }}
            className="text-sm text-[#717171] hover:text-[#222222]"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
