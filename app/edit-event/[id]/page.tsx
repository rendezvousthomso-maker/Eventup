import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EditEventForm } from "@/components/edit-event-form"

interface EditEventPageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Fetch the event and verify ownership via API
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/events/${params.id}`, {
    headers: {
      'Cookie': '', // Note: This is a server-side fetch, cookies will be handled differently
    },
  })

  if (!response.ok) {
    redirect("/dashboard")
  }

  const event = await response.json()

  // Verify ownership
  if (event.hostId !== session.user.id) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
            <p className="text-muted-foreground mt-2">Update your event details</p>
          </div>

          <EditEventForm event={event} />
        </div>
      </div>
    </div>
  )
}

