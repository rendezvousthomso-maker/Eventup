import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions as any)

    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = ((session as any).user as any).id

    const { status } = await request.json()

    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      // Verify the booking belongs to an event hosted by the current user
      const booking = await tx.booking.findUnique({
        where: { id: params.id },
        include: {
          event: {
            select: { 
              hostId: true,
              seats: true,
              id: true
            }
          }
        }
      })

      if (!booking) {
        throw new Error("Booking not found")
      }

      if (booking.event.hostId !== userId) {
        throw new Error("Unauthorized")
      }

      // If confirming a booking, check seat availability
      if (status === "CONFIRMED" && booking.status !== "CONFIRMED") {
        // Get all confirmed bookings for this event
        const confirmedBookings = await tx.booking.findMany({
          where: {
            eventId: booking.eventId,
            status: "CONFIRMED"
          }
        })

        // Calculate total confirmed seats (excluding current booking if it was already confirmed)
        const totalConfirmedSeats = confirmedBookings.reduce((sum: number, b: any) => sum + b.numberOfPeople, 0)
        
        // If current booking was not confirmed, add its seats to the total
        const seatsToAdd = booking.status !== "CONFIRMED" ? booking.numberOfPeople : 0
        
        if (totalConfirmedSeats + seatsToAdd > booking.event.seats) {
          throw new Error("Not enough seats available")
        }
      }

      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: params.id },
        data: { status: status as "CONFIRMED" | "CANCELLED" },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              seats: true
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
      })

      return updatedBooking
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating booking:", error)
    
    if (error instanceof Error) {
      if (error.message === "Booking not found") {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
      if (error.message === "Not enough seats available") {
        return NextResponse.json({ error: "Not enough seats available" }, { status: 400 })
      }
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
