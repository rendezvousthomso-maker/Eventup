import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't require authentication
        const publicPaths = [
          "/",
          "/auth/login",
          "/auth/sign-up", 
          "/auth/error",
          "/api/auth"
        ]
        
        const { pathname } = req.nextUrl
        
        // Allow public paths
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true
        }
        
        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
