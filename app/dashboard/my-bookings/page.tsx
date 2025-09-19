import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MyBookingsSection } from "@/components/my-bookings-section"

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-2">Track your reservation status for events</p>
        </div>

        <MyBookingsSection userId={session.user.id!} />
      </div>
    </DashboardLayout>
  )
}
