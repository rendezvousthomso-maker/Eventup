import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
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

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Calculate confirmed seats and available seats
    const confirmedBookings = event.bookings.filter((booking: any) => booking.status === "CONFIRMED")
    const totalConfirmedSeats = confirmedBookings.reduce((sum: number, booking: any) => sum + booking.numberOfPeople, 0)
    const seatsAvailable = event.seats - totalConfirmedSeats

    // Transform the data to match the expected format
    const transformedEvent = {
      id: event.id,
      title: event.name,
      name: event.name,
      description: event.description,
      category: event.category,
      date: event.date.toISOString().split('T')[0],
      time: event.time.toISOString().split('T')[1].split('.')[0],
      location: event.location,
      maps_link: event.mapsLink,
      max_attendees: event.seats,
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
      bookings_count: event._count.bookings
    }

    return NextResponse.json(transformedEvent)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the event belongs to the current user
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { hostId: true }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.hostId !== (session as any).user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the event (related bookings will be deleted due to CASCADE)
    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventData = await request.json()

    // Verify the event belongs to the current user
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { hostId: true }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.hostId !== (session as any).user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        name: eventData.name,
        description: eventData.description,
        category: eventData.category,
        date: eventData.date ? new Date(eventData.date) : undefined,
        time: eventData.time ? new Date(`1970-01-01T${eventData.time}`) : undefined,
        location: eventData.location,
        mapsLink: eventData.maps_link || "",
        seats: eventData.seats ? parseInt(eventData.seats.toString()) : undefined,
        hostName: eventData.hostName || "",
        hostWhatsapp: eventData.host_whatsapp || "",
        imageUrl: eventData.image_url || ""
      }
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
