import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc'
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    // Transform the data to match the expected format
    const transformedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      category: event.category,
      date: event.date.toISOString().split('T')[0],
      time: event.time.toISOString().split('T')[1].split('.')[0],
      location: event.location,
      address: event.address,
      seats: event.seats,
      host_name: event.hostName,
      host_whatsapp: event.hostWhatsapp,
      image_url: event.imageUrl,
      bookings_count: event._count.bookings
    }))

    return NextResponse.json(transformedEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventData = await request.json()

    const event = await prisma.event.create({
      data: {
        name: eventData.name,
        description: eventData.description,
        category: eventData.category,
        date: new Date(eventData.date),
        time: new Date(`1970-01-01T${eventData.time}`),
        location: eventData.location,
        address: eventData.address,
        seats: parseInt(eventData.seats),
        hostName: eventData.hostName,
        hostWhatsapp: eventData.hostWhatsapp,
        hostId: session.user.id,
        imageUrl: eventData.imageUrl
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
