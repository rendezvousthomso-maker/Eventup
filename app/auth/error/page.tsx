import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "OAuthCallback":
        return "There was an issue with the Google OAuth callback. Please try signing in again."
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account. Please sign in with the correct provider."
      case "OAuthCreateAccount":
        return "There was an issue creating your account. Please try again."
      case "EmailCreateAccount":
        return "There was an issue creating your account with email. Please try again."
      case "Callback":
        return "There was an issue with the authentication callback. Please try again."
      case "OAuthSignin":
        return "There was an issue signing in with OAuth. Please try again."
      case "EmailSignin":
        return "There was an issue signing in with email. Please try again."
      case "CredentialsSignin":
        return "Sign in with credentials was unsuccessful. Please check your credentials."
      case "SessionRequired":
        return "You must be signed in to access this page."
      case "Configuration":
        return "There was an issue with the authentication configuration."
      default:
        return "An authentication error occurred. Please try again."
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {params?.error ? getErrorMessage(params.error) : "An unspecified error occurred."}
              </p>
              {params?.error && (
                <p className="text-xs text-muted-foreground border-l-2 border-muted pl-2">
                  Error code: {params.error}
                </p>
              )}
              <div className="flex flex-col gap-2 pt-4">
                <Button asChild>
                  <Link href="/auth/login">
                    Try Again
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
