import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventForm } from "@/components/event-form"

export default async function CreateEventPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Host an Event</h1>
            <p className="text-gray-600">Create a memorable experience for your community</p>
          </div>
          <EventForm />
        </div>
      </div>
    </div>
  )
}
