import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
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

    if (event.hostId !== session.user.id) {
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
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
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

    if (event.hostId !== session.user.id) {
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
        address: eventData.address,
        seats: eventData.seats ? parseInt(eventData.seats) : undefined,
        hostName: eventData.hostName,
        hostWhatsapp: eventData.hostWhatsapp,
        imageUrl: eventData.imageUrl
      }
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
