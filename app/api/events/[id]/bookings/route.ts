import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventId = params.id

    // Get event details and verify host ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user is the host of this event
    if (event.hostId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all bookings for this event
    const bookings = await prisma.booking.findMany({
      where: { eventId: eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      event: event,
      bookings: bookings
    })
  } catch (error) {
    console.error("Error fetching event bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
