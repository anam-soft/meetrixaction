import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check each onboarding step
    const [
      meetingsCount,
      tasksCount,
      completedTasksCount,
      teamMembersCount,
      onboardingStatus,
    ] = await Promise.all([
      // Has uploaded meeting
      prisma.meetings.count({
        where: { user_id: user.id },
      }),
      
      // Has tasks (means they reviewed them)
      prisma.tasks.count({
        where: {
          meetings: {
            user_id: user.id,
          },
        },
      }),
      
      // Has completed a task
      prisma.tasks.count({
        where: {
          meetings: {
            user_id: user.id,
          },
          status: "completed",
        },
      }),
      
      // Has invited teammate
      prisma.team_members.count({
        where: { user_id: user.id },
      }),
      
      // Get onboarding status from user metadata
      prisma.users.findUnique({
        where: { id: user.id },
        select: {
          // Assuming you have these fields, adjust as needed
          // onboarding_dismissed: true,
        },
      }),
    ]);

    const progress = {
      hasUploadedMeeting: meetingsCount > 0,
      hasReviewedTasks: tasksCount > 0,
      hasInvitedTeammate: teamMembersCount > 0,
      hasCompletedTask: completedTasksCount > 0,
      onboardingDismissed: false, // Get from user metadata if available
    };

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch onboarding progress" },
      { status: 500 }
    );
  }
}
