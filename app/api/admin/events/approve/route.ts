import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!(session as any)?.user || !(session as any).user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: (session as any).user.id },
      select: { userType: true }
    })

    const userType = currentUser?.userType ? String(currentUser.userType) : 'USER'

    if (userType !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { eventId, action } = await request.json()

    if (!eventId || !action) {
      return NextResponse.json({ error: "Event ID and action are required" }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: "Action must be either 'approve' or 'reject'" }, { status: 400 })
    }

    if (action === 'approve') {
      // Update event status to approved
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: { status: 'approved' }
      })
      
      return NextResponse.json({ 
        message: "Event approved successfully", 
        event: updatedEvent 
      })
    } else {
      // Delete the event if rejected
      await prisma.event.delete({
        where: { id: eventId }
      })
      
      return NextResponse.json({ 
        message: "Event rejected and deleted successfully" 
      })
    }
  } catch (error) {
    console.error("Error processing event approval:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

