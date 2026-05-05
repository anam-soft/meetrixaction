import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"

/**
 * Get the current authenticated user from NextAuth session
 * This replaces the Clerk-based getCurrentUser function
 */
export async function getCurrentUser() {
  try {
    console.log("🔍 getCurrentUser: Starting...")
    const session = await getServerSession(authOptions)
    console.log("🔍 getCurrentUser: Session:", session ? "Found" : "Not found")
    
    if (!session?.user?.email) {
      console.log("🔍 getCurrentUser: No session or email")
      return null
    }

    console.log("🔍 getCurrentUser: Looking up user by email:", session.user.email)
    
    // Find user by email from session
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: true,
      },
    })

    console.log("🔍 getCurrentUser: User found:", user ? "Yes" : "No")
    return user
  } catch (error) {
    console.error("❌ Error getting current user:", error)
    return null
  }
}

/**
 * Get user ID from session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  return !!session?.user
}
