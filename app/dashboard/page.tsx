import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MyEventsSection } from "@/components/my-events-section"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Host Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your events and connect with attendees</p>
        </div>

        <MyEventsSection userId={session.user.id!} />
      </div>
    </DashboardLayout>
  )
}
