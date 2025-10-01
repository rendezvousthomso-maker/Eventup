import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!(session as any)?.user || !(session as any).user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingCount = await prisma.event.count({
      where: {
        hostId: (session as any).user.id,
        status: 'created'
      }
    })

    return NextResponse.json({ count: pendingCount })
  } catch (error) {
    console.error("Error fetching pending events count:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

