import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
          userId: session.user.id
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

    const totalBookedSeats = confirmedBookings.reduce((sum, booking) => sum + booking.numberOfPeople, 0)
    
    if (totalBookedSeats + numberOfPeople > event.seats) {
      return NextResponse.json({ error: "Not enough seats available" }, { status: 400 })
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        eventId: eventId,
        userId: session.user.id,
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
