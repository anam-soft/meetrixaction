import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "./prisma"

/**
 * Get the current authenticated user from Clerk session
 * Syncs Clerk user with database
 */
export async function getCurrentUser() {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return null
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    
    if (!email) {
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
