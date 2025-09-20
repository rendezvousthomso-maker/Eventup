"use client"

import { EventForm } from "@/components/event-form"
import { usePageContentLoaded } from "@/hooks/use-page-content-loaded"
import { useEffect, useRef } from "react"

export function CreateEventPageClient() {
  const formRef = useRef<HTMLDivElement>(null)
  
  // Signal that create-event content is loaded when form is ready
  usePageContentLoaded({ 
    loadingKey: "host-event",
    dependencies: [formRef.current] // Wait for form to be rendered
  })

  useEffect(() => {
    // Additional check to ensure form is fully loaded
    const checkFormLoaded = () => {
      if (formRef.current) {
        // Check if form elements are present and rendered
        const formElements = formRef.current.querySelectorAll('input, textarea, select')
        if (formElements.length > 0) {
          // Form is loaded, signal completion
          setTimeout(() => {
            // This will be handled by the usePageContentLoaded hook
          }, 200) // Small delay to ensure all form elements are interactive
        }
      }
    }

    // Check immediately and after a short delay
    checkFormLoaded()
    const timer = setTimeout(checkFormLoaded, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Host an Event</h1>
            <p className="text-gray-600">Create a memorable experience for your community</p>
          </div>
          <div ref={formRef}>
            <EventForm />
          </div>
        </div>
      </div>
    </div>
  )
}
