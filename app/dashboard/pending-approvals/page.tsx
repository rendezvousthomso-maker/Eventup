import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PendingApprovalsClient } from "./pending-approvals-client"
import { prisma } from "@/lib/prisma"

export default async function PendingApprovalsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { userType: true }
  })

  const userType = currentUser?.userType ? String(currentUser.userType) : 'USER'
  
  if (userType !== 'ADMIN') {
    redirect("/dashboard")
  }

  return (
    <DashboardLayout>
      <PendingApprovalsClient />
    </DashboardLayout>
  )
}

