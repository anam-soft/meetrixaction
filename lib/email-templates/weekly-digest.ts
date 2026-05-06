interface Task {
  id: string;
  title: string;
  assignee?: string;
  deadline?: string;
}

interface WeeklyDigestEmailProps {
  teamName: string;
  weekStart: string;
  weekEnd: string;
  tasksCompleted: number;
  tasksOpen: number;
  tasksOverdue: number;
  aiInsight?: string;
  overdueTasks: Task[];
  completedTasks: Task[];
  dashboardUrl: string;
  unsubscribeUrl: string;
  isPro: boolean;
}

export function generateWeeklyDigestEmail({
  teamName,
  weekStart,
  weekEnd,
  tasksCompleted,
  tasksOpen,
  tasksOverdue,
  aiInsight,
  overdueTasks,
  completedTasks,
  dashboardUrl,
  unsubscribeUrl,
  isPro,
}: WeeklyDigestEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your team's week in review — MeetRix Action</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 10px;
    }
    .week-range {
      color: #f3e8ff;
      font-size: 14px;
    }
    .team-name {
      color: #ffffff;
      font-size: 16px;
      margin-top: 10px;
      font-weight: 500;
    }
    .content {
      padding: 30px;
    }
    .stats-row {
      display: table;
      width: 100%;
      margin-bottom: 30px;
    }
    .stat-card {
      display: table-cell;
      width: 33.33%;
      padding: 20px;
      text-align: center;
      background-color: #f9fafb;
      border-radius: 8px;
    }
    .stat-card:not(:last-child) {
      padding-right: 10px;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-card.completed .stat-number { color: #10b981; }
    .stat-card.open .stat-number { color: #3b82f6; }
    .stat-card.overdue .stat-number { color: #ef4444; }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .ai-insight {
      background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
      border-left: 4px solid #9333ea;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      position: relative;
    }
    .ai-badge {
      display: inline-block;
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
      color: #ffffff;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ai-insight-text {
      color: #581c87;
      font-size: 15px;
      line-height: 1.6;
      margin: 0;
    }
    .task-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .task-item {
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 8px;
      margin-bottom: 10px;
      border-left: 3px solid #e5e7eb;
    }
    .task-item.overdue {
      border-left-color: #ef4444;
      background-color: #fef2f2;
    }
    .task-title {
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 5px;
    }
    .task-meta {
      font-size: 13px;
      color: #6b7280;
    }
    .task-meta span {
      margin-right: 15px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      margin: 20px 0;
    }
    .cta-container {
      text-align: center;
      padding: 30px 0;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
    }
    .footer {
      padding: 30px;
      text-align: center;
      background-color: #f9fafb;
      color: #6b7280;
      font-size: 13px;
    }
    .footer a {
      color: #9333ea;
      text-decoration: none;
    }
    .empty-state {
      text-align: center;
      padding: 30px;
      color: #9ca3af;
      font-size: 14px;
    }
    @media only screen and (max-width: 600px) {
      .stats-row {
        display: block;
      }
      .stat-card {
        display: block;
        width: 100%;
        margin-bottom: 10px;
      }
      .stat-card:not(:last-child) {
        padding-right: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">✨ MeetRix Action</div>
      <div class="week-range">${weekStart} - ${weekEnd}</div>
      <div class="team-name">${teamName}</div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card completed">
          <div class="stat-number">${tasksCompleted}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card open">
          <div class="stat-number">${tasksOpen}</div>
          <div class="stat-label">Still Open</div>
        </div>
        <div class="stat-card overdue">
          <div class="stat-number">${tasksOverdue}</div>
          <div class="stat-label">Overdue</div>
        </div>
      </div>

      <!-- AI Insight (Pro only) -->
      ${isPro && aiInsight ? `
      <div class="ai-insight">
        <span class="ai-badge">✨ AI Insight</span>
        <p class="ai-insight-text">${aiInsight}</p>
      </div>
      ` : ''}

      <!-- Overdue Tasks -->
      ${overdueTasks.length > 0 ? `
      <div class="section">
        <h2 class="section-title">⚠️ Overdue Tasks</h2>
        <ul class="task-list">
          ${overdueTasks.map(task => `
          <li class="task-item overdue">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              ${task.assignee ? `<span>👤 ${task.assignee}</span>` : ''}
              ${task.deadline ? `<span>📅 Due: ${new Date(task.deadline).toLocaleDateString()}</span>` : ''}
            </div>
          </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Completed This Week -->
      ${completedTasks.length > 0 ? `
      <div class="section">
        <h2 class="section-title">✅ Completed This Week</h2>
        <ul class="task-list">
          ${completedTasks.slice(0, 10).map(task => `
          <li class="task-item">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              ${task.assignee ? `<span>👤 ${task.assignee}</span>` : ''}
            </div>
          </li>
          `).join('')}
        </ul>
        ${completedTasks.length > 10 ? `
        <div style="text-align: center; margin-top: 15px; color: #6b7280; font-size: 13px;">
          + ${completedTasks.length - 10} more completed tasks
        </div>
        ` : ''}
      </div>
      ` : `
      <div class="empty-state">
        No tasks completed this week. Keep pushing forward! 💪
      </div>
      `}

      <!-- CTA -->
      <div class="cta-container">
        <a href="${dashboardUrl}" class="cta-button">View Full Report →</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Sent every Monday at 8:00 AM</p>
      <p>
        <a href="${dashboardUrl}/settings">Manage preferences</a> · 
        <a href="${unsubscribeUrl}">Unsubscribe</a>
      </p>
      <p style="margin-top: 20px; color: #9ca3af;">
        © ${new Date().getFullYear()} MeetRix Action. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
