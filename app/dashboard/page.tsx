import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MyEventsSection } from "@/components/my-events-section"
import { DashboardPageClient } from "./dashboard-page-client"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <DashboardPageClient userId={session.user.id!} />
    </DashboardLayout>
  )
}
