import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = ((session as any).user as any).id

    const { eventId, numberOfPeople } = await request.json()

    if (!eventId || !numberOfPeople || numberOfPeople <= 0) {
      return NextResponse.json({ error: "Invalid booking data" }, { status: 400 })
    }

    // Check if event exists and has available seats
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
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

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user already has a booking for this event
    const existingBooking = await prisma.booking.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: userId
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json({ error: "You already have a booking for this event" }, { status: 409 })
    }

    // Check if there are enough seats available
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        eventId: eventId,
        status: "CONFIRMED"
      }
    })

    const totalBookedSeats = confirmedBookings.reduce((sum: number, booking: any) => sum + booking.numberOfPeople, 0)
    
    if (totalBookedSeats + numberOfPeople > event.seats) {
      return NextResponse.json({ error: "Not enough seats available" }, { status: 400 })
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        eventId: eventId,
        userId: userId,
        numberOfPeople: numberOfPeople,
        status: "PENDING"
      },
      include: {
        event: {
          select: {
            name: true,
            date: true,
            time: true,
            location: true
          }
        }
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = ((session as any).user as any).id

    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get('hostId')

    let whereClause = {}
    let includeClause = {}

    if (hostId) {
      // Fetch bookings for events hosted by the specified host
      whereClause = {
        event: {
          hostId: hostId
        }
      }
      includeClause = {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            date: true,
            time: true,
            location: true,
            address: true,
            seats: true,
            hostName: true,
            hostWhatsapp: true,
            imageUrl: true,
            hostId: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    } else {
      // Fetch bookings for the current user
      whereClause = { userId: userId }
      includeClause = {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            date: true,
            time: true,
            location: true,
            address: true,
            seats: true,
            hostName: true,
            hostWhatsapp: true,
            imageUrl: true
          }
        }
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: includeClause,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the response to match the component's expected structure
    const transformedBookings = bookings.map((booking: any) => ({
      id: booking.id,
      status: booking.status.toLowerCase(), // Convert to lowercase to match component expectations
      numberOfPeople: booking.numberOfPeople,
      createdAt: booking.createdAt.toISOString(),
      event: {
        id: booking.event.id,
        name: booking.event.name,
        description: booking.event.description,
        category: booking.event.category,
        date: booking.event.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        time: booking.event.time.toISOString().split('T')[1].split('.')[0], // Format time as HH:MM:SS
        location: booking.event.location,
        address: booking.event.address,
        hostName: booking.event.hostName,
        hostWhatsapp: booking.event.hostWhatsapp,
        imageUrl: booking.event.imageUrl
      },
      user: booking.user ? {
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email
      } : null
    }))

    return NextResponse.json(transformedBookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
