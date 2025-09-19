import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "pg"

// Create PostgreSQL connection pool for database adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development", // Only debug in development
  callbacks: {
    async signIn({ user, account, profile, email }) {
      if (process.env.NODE_ENV === "development") {
        console.log("SignIn callback:", { user, account, profile, email });
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (process.env.NODE_ENV === "development") {
        console.log("Redirect callback:", { url, baseUrl });
      }
      
      try {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`
        
        // Allows callback URLs on the same origin
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        if (urlObj.origin === baseUrlObj.origin) return url
        
        // Default to home page on successful auth
        return baseUrl
      } catch (error) {
        console.error("Redirect error:", error);
        return baseUrl;
      }
    },
    async session({ session, user }) {
      if (process.env.NODE_ENV === "development") {
        console.log("Session callback:", { session, user });
      }
      // With database adapter, user info comes from database
      if (user && session.user) {
        session.user.id = user.id
        session.user.name = user.name
        session.user.email = user.email
        session.user.image = user.image
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
