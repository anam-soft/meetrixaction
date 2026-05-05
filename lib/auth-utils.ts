import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "./prisma"

/**
 * Get the current authenticated user from Clerk session
 * Syncs Clerk user with database
 */
export async function getCurrentUser() {
  try {
    console.log("🔍 getCurrentUser: Starting...")
    const clerkUser = await currentUser()
    console.log("🔍 getCurrentUser: Clerk user:", clerkUser ? "Found" : "Not found")
    
    if (!clerkUser) {
      console.log("🔍 getCurrentUser: No Clerk user")
      return null
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    console.log("🔍 getCurrentUser: Looking up user by email:", email)
    
    if (!email) {
      console.log("🔍 getCurrentUser: No email found")
      return null
    }

    // Find user by clerk_id first, then by email
    let user = await prisma.users.findUnique({
      where: { clerk_id: clerkUser.id },
      include: {
        subscriptions: true,
      },
    })

    // If not found by clerk_id, try email
    if (!user) {
      user = await prisma.users.findUnique({
        where: { email },
        include: {
          subscriptions: true,
        },
      })
      
      // Update with clerk_id if found by email
      if (user) {
        user = await prisma.users.update({
          where: { id: user.id },
          data: {
            clerk_id: clerkUser.id,
            updated_at: new Date(),
          },
          include: {
            subscriptions: true,
          },
        })
      }
    }

    // Create user if doesn't exist
    if (!user) {
      console.log("🔍 getCurrentUser: Creating new user")
      user = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          clerk_id: clerkUser.id,
          email,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          image: clerkUser.imageUrl,
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          subscriptions: true,
        },
      })
    }

    console.log("🔍 getCurrentUser: User found/created:", user ? "Yes" : "No")
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
  const clerkUser = await currentUser()
  return !!clerkUser
}
