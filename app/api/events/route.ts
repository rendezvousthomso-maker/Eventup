import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get('hostId')

    let whereClause = {}
    if (hostId) {
      whereClause = { hostId: hostId }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
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
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
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
    const transformedEvents = events.map((event) => ({
      id: event.id,
      title: event.name, // Map name to title for compatibility
      name: event.name,
      description: event.description,
      category: event.category,
      date: event.date.toISOString().split('T')[0],
      time: event.time.toISOString().split('T')[1].split('.')[0],
      location: event.location,
      address: event.address,
      max_attendees: event.seats, // Map seats to max_attendees for compatibility
      seats: event.seats,
      host_name: event.hostName,
      host_whatsapp: event.hostWhatsapp,
      image_url: event.imageUrl,
      created_at: event.createdAt.toISOString(),
      bookings: event.bookings.map((booking) => ({
        id: booking.id,
        status: booking.status.toLowerCase(),
        number_of_people: booking.numberOfPeople,
        user: booking.user,
        created_at: booking.createdAt.toISOString()
      })),
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
