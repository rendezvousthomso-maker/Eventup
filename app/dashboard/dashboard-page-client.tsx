"use client"

import { MyEventsSection } from "@/components/my-events-section"
import { usePageContentLoaded } from "@/hooks/use-page-content-loaded"

interface DashboardPageClientProps {
  userId: string
}

export function DashboardPageClient({ userId }: DashboardPageClientProps) {
  // Signal that dashboard content is loaded
  usePageContentLoaded({ loadingKey: "dashboard" })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Host Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your events and connect with attendees</p>
      </div>

      <MyEventsSection userId={userId} />
    </div>
  )
}
