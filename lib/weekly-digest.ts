import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface WeekStats {
  tasksCompleted: number;
  tasksOpen: number;
  tasksOverdue: number;
  completionRate: number;
  lastWeekCompletionRate: number;
  overduePatterns: string[];
}

export async function generateWeeklyInsight(stats: WeekStats): Promise<string> {
  const prompt = `Given this team's task data for the past week, write 1-2 sentences of insight.
Focus on: completion rate trend vs last week, any recurring overdue patterns, positive observations.
Be specific with numbers. Keep it encouraging but honest.
Tone: professional, concise, data-driven.

Data:
- Tasks completed this week: ${stats.tasksCompleted}
- Tasks still open: ${stats.tasksOpen}
- Tasks overdue: ${stats.tasksOverdue}
- Completion rate this week: ${stats.completionRate}%
- Completion rate last week: ${stats.lastWeekCompletionRate}%
- Recurring overdue patterns: ${stats.overduePatterns.join(", ") || "None"}

Write the insight:`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional productivity analyst. Generate concise, data-driven insights about team performance.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || "Your team is making steady progress this week.";
  } catch (error) {
    console.error("Failed to generate AI insight:", error);
    return "Your team is making steady progress this week.";
  }
}
