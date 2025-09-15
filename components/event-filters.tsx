"use client"
import { Heart, Gamepad2, TreePine } from "lucide-react"

interface EventFiltersProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

const categories = [
  { id: "Pet Meet", label: "Pet Meet", icon: Heart },
  { id: "Games Night", label: "Games Night", icon: Gamepad2 },
  { id: "Recreation", label: "Recreation", icon: TreePine },
]

export function EventFilters({ selectedCategory, onCategoryChange }: EventFiltersProps) {
  return (
    <div className="mb-8">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onCategoryChange(null)}
          className={`flex-shrink-0 px-6 py-3 rounded-full border transition-all duration-200 ${
            selectedCategory === null
              ? "bg-[#222222] text-white border-[#222222]"
              : "bg-white text-[#717171] border-gray-300 hover:border-gray-400"
          }`}
        >
          <span className="text-sm font-medium">All Events</span>
        </button>

        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-200 ${
                isSelected
                  ? "bg-[#222222] text-white border-[#222222]"
                  : "bg-white text-[#717171] border-gray-300 hover:border-gray-400"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
