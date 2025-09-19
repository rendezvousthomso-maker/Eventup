import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()

    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Verify the booking belongs to an event hosted by the current user
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        event: {
          select: { hostId: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.event.hostId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: status as "CONFIRMED" | "CANCELLED" }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
