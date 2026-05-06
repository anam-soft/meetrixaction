import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeeklyInsight } from "@/lib/weekly-digest";
import { generateWeeklyDigestEmail } from "@/lib/email-templates/weekly-digest";

export const dynamic = 'force-dynamic';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// Schedule: Every Monday at 8:00 AM
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users (filter by digest preference if column exists)
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const results = [];

    for (const user of users) {
      try {
        // Check if user has active subscription
        const subscription = await prisma.subscriptions.findFirst({
          where: {
            user_id: user.id,
          },
        });
        const isPro = subscription?.stripe_status === "active";

        // Calculate week range
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const weekEnd = new Date(now);

        // Get tasks for the past week
        const tasks = await prisma.tasks.findMany({
          where: {
            meetings: {
              user_id: user.id,
            },
            created_at: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
          include: {
            users: {
              select: {
                name: true,
              },
            },
            meetings: {
              select: {
                title: true,
              },
            },
          },
        });

        // Calculate stats
        const tasksCompleted = tasks.filter(t => t.status === "completed").length;
        const tasksOpen = tasks.filter(t => t.status === "pending").length;
        const tasksOverdue = tasks.filter(
          t => t.status === "pending" && t.deadline && new Date(t.deadline) < now
        ).length;

        // Get previous week stats for comparison
        const prevWeekStart = new Date(weekStart);
        prevWeekStart.setDate(weekStart.getDate() - 7);
        const prevWeekTasks = await prisma.tasks.findMany({
          where: {
            meetings: {
              user_id: user.id,
            },
            created_at: {
              gte: prevWeekStart,
              lte: weekStart,
            },
          },
        });

        const prevWeekCompleted = prevWeekTasks.filter(t => t.status === "completed").length;
        const prevWeekTotal = prevWeekTasks.length;
        const lastWeekCompletionRate = prevWeekTotal > 0 
          ? Math.round((prevWeekCompleted / prevWeekTotal) * 100) 
          : 0;

        const currentTotal = tasks.length;
        const completionRate = currentTotal > 0 
          ? Math.round((tasksCompleted / currentTotal) * 100) 
          : 0;

        // Generate AI insight (Pro only)
        let aiInsight = undefined;
        if (isPro && currentTotal > 0) {
          aiInsight = await generateWeeklyInsight({
            tasksCompleted,
            tasksOpen,
            tasksOverdue,
            completionRate,
            lastWeekCompletionRate,
            overduePatterns: [],
          });
        }

        // Get overdue and completed tasks
        const overdueTasks = tasks
          .filter(t => t.status === "pending" && t.deadline && new Date(t.deadline) < now)
          .slice(0, 10)
          .map(t => ({
            id: t.id,
            title: t.title,
            assignee: t.users?.name || undefined,
            deadline: t.deadline?.toISOString() || undefined,
          }));

        const completedTasks = tasks
          .filter(t => t.status === "completed")
          .map(t => ({
            id: t.id,
            title: t.title,
            assignee: t.users?.name || undefined,
          }));

        // Generate email HTML
        const emailHtml = generateWeeklyDigestEmail({
          teamName: user.name || "Your Team",
          weekStart: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          weekEnd: weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          tasksCompleted,
          tasksOpen,
          tasksOverdue,
          aiInsight,
          overdueTasks,
          completedTasks,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${user.id}`,
          isPro,
        });

        // Send email (integrate with your email service)
        // Example: await sendEmail(user.email, "Your team's week in review — MeetRix Action", emailHtml);
        
        results.push({
          userId: user.id,
          email: user.email,
          status: "prepared",
          stats: { tasksCompleted, tasksOpen, tasksOverdue },
        });

      } catch (error) {
        console.error(`Failed to generate digest for user ${user.id}:`, error);
        results.push({
          userId: user.id,
          email: user.email,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });

  } catch (error) {
    console.error("Weekly digest cron error:", error);
    return NextResponse.json(
      { error: "Failed to process weekly digests" },
      { status: 500 }
    );
  }
}
