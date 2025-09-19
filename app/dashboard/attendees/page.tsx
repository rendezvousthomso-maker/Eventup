import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AllAttendeesSection } from "@/components/all-attendees-section"

export default async function AttendeesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Attendees</h1>
          <p className="text-muted-foreground mt-2">View and manage attendees across all your events</p>
        </div>

        <AllAttendeesSection userId={session.user.id!} />
      </div>
    </DashboardLayout>
  )
}
