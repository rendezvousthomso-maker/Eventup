import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { EventForm } from "@/components/event-form"
import { CreateEventPageClient } from "./create-event-page-client"

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  return <CreateEventPageClient />
}
