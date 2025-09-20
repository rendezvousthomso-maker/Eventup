import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Map enum values to display strings
const categoryMap: Record<string, string> = {
  'PET_MEET': 'Pet Meet',
  'GAMES_NIGHT': 'Games Night', 
  'RECREATION': 'Recreation'
}

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
            bookings: {
              where: {
                status: "CONFIRMED"
              }
            }
          }
        }
      }
    })

    // Transform the data to match the expected format
    const transformedEvents = events.map((event: any) => {
      // Calculate confirmed seats
      const confirmedBookings = event.bookings.filter((booking: any) => booking.status === "CONFIRMED")
      const totalConfirmedSeats = confirmedBookings.reduce((sum: number, booking: any) => sum + booking.numberOfPeople, 0)
      const seatsAvailable = event.seats - totalConfirmedSeats

      return {
        id: event.id,
        title: event.name, // Map name to title for compatibility
        name: event.name,
        description: event.description,
        category: categoryMap[event.category] || event.category, // Map enum to display string
        date: event.date.toISOString().split('T')[0],
        time: event.time.toISOString().split('T')[1].split('.')[0],
        location: event.location,
        address: event.address,
        max_attendees: event.seats, // Map seats to max_attendees for compatibility
        seats: event.seats,
        seats_available: seatsAvailable,
        seats_confirmed: totalConfirmedSeats,
        host_name: event.hostName,
        host_whatsapp: event.hostWhatsapp,
        image_url: event.imageUrl,
        created_at: event.createdAt.toISOString(),
        bookings: event.bookings.map((booking: any) => ({
          id: booking.id,
          status: booking.status.toLowerCase(),
          number_of_people: booking.numberOfPeople,
          user: booking.user,
          created_at: booking.createdAt.toISOString()
        })),
        bookings_count: event._count.bookings,
        confirmed_bookings_count: confirmedBookings.length
      }
    })

    return NextResponse.json(transformedEvents)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!(session as any)?.user || !(session as any).user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventData = await request.json()

    // Map display string back to enum value
    const reverseCategoryMap: Record<string, string> = {
      'Pet Meet': 'PET_MEET',
      'Games Night': 'GAMES_NIGHT',
      'Recreation': 'RECREATION'
    }
    
    // Use a transaction to ensure atomicity and better connection management
    const event = await prisma.$transaction(async (tx: any) => {
      return await tx.event.create({
        data: {
          name: eventData.name,
          description: eventData.description,
          category: reverseCategoryMap[eventData.category] || eventData.category,
          date: new Date(eventData.date),
          time: new Date(`1970-01-01T${eventData.time}`),
          location: eventData.location,
          address: eventData.address,
          seats: parseInt(eventData.seats),
          hostName: eventData.hostName,
          hostWhatsapp: eventData.hostWhatsapp,
          hostId: (session as any).user.id,
          imageUrl: eventData.imageUrl
        }
      })
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error creating event:", error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('P2024')) {
        return NextResponse.json({ 
          error: "Database connection timeout. Please try again." 
        }, { status: 503 })
      }
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
