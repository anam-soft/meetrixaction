import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "./prisma"

export async function syncUser() {
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    return null
  }

  // Check if user exists in our database by clerk_id first
  let user = await prisma.users.findUnique({
    where: { clerk_id: clerkUser.id },
    include: {
      subscriptions: true,
    },
  })

  // If user doesn't exist, try to find by email (in case they were created differently)
  if (!user) {
    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (email) {
      user = await prisma.users.findUnique({
        where: { email },
        include: {
          subscriptions: true,
        },
      })
      
      // If found by email, update with clerk_id
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
  }

  // If still no user, create them
  if (!user) {
    try {
      user = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          clerk_id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          image: clerkUser.imageUrl,
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          subscriptions: true,
        },
      })
    } catch (error: any) {
      // If duplicate email error, try to find and update
      if (error.code === 'P2002') {
        const email = clerkUser.emailAddresses[0]?.emailAddress
        if (email) {
          user = await prisma.users.findUnique({
            where: { email },
            include: {
              subscriptions: true,
            },
          })
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
      }
      if (!user) {
        throw error
      }
    }
  }

  return user
}

export async function getCurrentUser() {
  return await syncUser()
}
