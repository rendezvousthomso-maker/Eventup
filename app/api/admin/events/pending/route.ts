import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Map enum values to display strings
const categoryMap: Record<string, string> = {
  'PET_MEET': 'Pet Meet',
  'GAMES_NIGHT': 'Games Night', 
  'RECREATION': 'Recreation'
}

export async function GET(request: NextRequest) {
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

    // Get all events with 'created' status
    const pendingEvents = await prisma.event.findMany({
      where: { status: 'created' },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Transform the data to match the expected format
    const transformedEvents = pendingEvents.map((event: any) => ({
      id: event.id,
      title: event.name,
      name: event.name,
      description: event.description,
      category: categoryMap[event.category] || event.category,
      date: event.date.toISOString().split('T')[0],
      time: event.time.toISOString().split('T')[1].split('.')[0],
      location: event.location,
      maps_link: event.mapsLink,
      seats: event.seats,
      host_name: event.hostName,
      host_whatsapp: event.hostWhatsapp,
      image_url: event.imageUrl,
      created_at: event.createdAt.toISOString(),
      status: event.status,
      host: event.host
    }))

    return NextResponse.json(transformedEvents)
  } catch (error) {
    console.error("Error fetching pending events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

