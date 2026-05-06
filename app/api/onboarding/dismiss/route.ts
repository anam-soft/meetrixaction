import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Store dismissal in user metadata or separate table
    // For now, we'll use localStorage on client-side
    // In production, you might want to add an onboarding_dismissed field to users table
    
    // Option 1: Update user table (if field exists)
    // await prisma.users.update({
    //   where: { id: user.id },
    //   data: { onboarding_dismissed: true },
    // });

    // Option 2: Create onboarding_progress table
    // await prisma.onboarding_progress.upsert({
    //   where: { user_id: user.id },
    //   update: { dismissed: true },
    //   create: { user_id: user.id, dismissed: true },
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to dismiss onboarding" },
      { status: 500 }
    );
  }
}
