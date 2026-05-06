import { useState, useEffect } from "react";

interface UseUpgradeNudgeReturn {
  showNudge: boolean;
  nudgeTrigger: "meeting-limit" | "team-limit" | "pro-feature" | null;
  currentUsage: number;
  limit: number;
  featureName: string;
  checkMeetingLimit: (usage: number, limit: number, isPro: boolean) => void;
  checkTeamLimit: (memberCount: number, isPro: boolean) => void;
  checkProFeature: (featureName: string, isPro: boolean) => void;
  dismissNudge: () => void;
}

export function useUpgradeNudge(): UseUpgradeNudgeReturn {
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeTrigger, setNudgeTrigger] = useState<"meeting-limit" | "team-limit" | "pro-feature" | null>(null);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [featureName, setFeatureName] = useState("");

  // Check if user has dismissed nudge recently (within last hour)
  const hasRecentlyDismissed = (key: string): boolean => {
    const dismissed = localStorage.getItem(`nudge_dismissed_${key}`);
    if (!dismissed) return false;
    
    const dismissedTime = parseInt(dismissed);
    const oneHour = 60 * 60 * 1000;
    return Date.now() - dismissedTime < oneHour;
  };

  const checkMeetingLimit = (usage: number, meetingLimit: number, isPro: boolean) => {
    if (isPro) return;

    setCurrentUsage(usage);
    setLimit(meetingLimit);

    // Show nudge when user has 1 meeting left or reached limit
    const remaining = meetingLimit - usage;
    
    if (remaining === 1 && !hasRecentlyDismissed("meeting_1_left")) {
      setNudgeTrigger("meeting-limit");
      setShowNudge(true);
    } else if (remaining === 0 && !hasRecentlyDismissed("meeting_limit_reached")) {
      setNudgeTrigger("meeting-limit");
      setShowNudge(true);
    }
  };

  const checkTeamLimit = (memberCount: number, isPro: boolean) => {
    if (isPro) return;

    // Show nudge when trying to add 3rd team member
    if (memberCount >= 2 && !hasRecentlyDismissed("team_limit")) {
      setNudgeTrigger("team-limit");
      setShowNudge(true);
    }
  };

  const checkProFeature = (feature: string, isPro: boolean) => {
    if (isPro) return;

    if (!hasRecentlyDismissed(`pro_feature_${feature}`)) {
      setFeatureName(feature);
      setNudgeTrigger("pro-feature");
      setShowNudge(true);
    }
  };

  const dismissNudge = () => {
    setShowNudge(false);
    
    // Store dismissal time
    if (nudgeTrigger === "meeting-limit") {
      const remaining = limit - currentUsage;
      const key = remaining === 1 ? "meeting_1_left" : "meeting_limit_reached";
      localStorage.setItem(`nudge_dismissed_${key}`, Date.now().toString());
    } else if (nudgeTrigger === "team-limit") {
      localStorage.setItem("nudge_dismissed_team_limit", Date.now().toString());
    } else if (nudgeTrigger === "pro-feature") {
      localStorage.setItem(`nudge_dismissed_pro_feature_${featureName}`, Date.now().toString());
    }
  };

  return {
    showNudge,
    nudgeTrigger,
    currentUsage,
    limit,
    featureName,
    checkMeetingLimit,
    checkTeamLimit,
    checkProFeature,
    dismissNudge,
  };
}
