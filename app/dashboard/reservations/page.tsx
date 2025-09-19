import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ReservationRequestsSection } from "@/components/reservation-requests-section"

export default async function ReservationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservation Requests</h1>
          <p className="text-muted-foreground mt-2">Manage booking requests for your events</p>
        </div>

        <ReservationRequestsSection userId={session.user.id!} />
      </div>
    </DashboardLayout>
  )
}
