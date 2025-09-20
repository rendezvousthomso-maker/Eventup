import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EditEventForm } from "@/components/edit-event-form"
import { prisma } from "@/lib/prisma"

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

  // Fetch the event and verify ownership directly from database
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      date: true,
      time: true,
      location: true,
      seats: true,
      hostName: true,
      hostWhatsapp: true,
      imageUrl: true,
      hostId: true
    }
  })

  if (!event) {
    redirect("/dashboard")
  }

  // Verify ownership
  if (event.hostId !== session.user.id) {
    redirect("/dashboard")
  }

  // Transform the event data to match the form interface
  const transformedEvent = {
    id: event.id,
    name: event.name,
    description: event.description,
    category: event.category,
    date: event.date.toISOString().split('T')[0],
    time: event.time.toISOString().split('T')[1].split('.')[0],
    location: event.location,
    seats: event.seats,
    image_url: event.imageUrl,
    host_whatsapp: event.hostWhatsapp
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
            <p className="text-muted-foreground mt-2">Update your event details</p>
          </div>

          <EditEventForm event={transformedEvent} />
        </div>
      </div>
    </div>
  )
}

