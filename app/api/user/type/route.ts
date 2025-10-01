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

    const user = await prisma.user.findUnique({
      where: { id: (session as any).user.id },
      select: { userType: true, email: true }
    })

    // Explicitly convert enum to string to ensure consistency
    const userType = user?.userType ? String(user.userType) : 'USER'
    
    console.log('User type API response:', { 
      userId: (session as any).user.id,
      email: user?.email,
      rawUserType: user?.userType,
      returnedUserType: userType
    })

    return NextResponse.json({ userType })
  } catch (error) {
    console.error("Error fetching user type:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

