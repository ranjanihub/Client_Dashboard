import { useState, useEffect } from "react";

export interface OutcomeRecord {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  avatarBg: string;
  assessmentName: string;
  assessmentCode: string;
  sessionMilestone: number; // e.g., 3, 6, 9, 12
  previousScore: number;
  currentScore: number;
  maxScore: number;
  changeValue: number; // currentScore - previousScore
  changeLabel: string; // "-5 points", "+4 points", "No change"
  changeDirection: "decreased" | "increased" | "unchanged";
  completedDate: string;
  therapistNotified: boolean;
  notifiedAt: string;
  details?: {
    q: string;
    prev: string;
    curr: string;
  }[];
}

export interface OutcomeNotification {
  id: string;
  outcomeId: string;
  clientName: string;
  assessmentName: string;
  previousScore: number;
  currentScore: number;
  changeLabel: string;
  changeValue: number;
  sessionMilestone: number;
  completedDate: string;
  timestamp: string;
  read: boolean;
}

export const INITIAL_OUTCOMES: OutcomeRecord[] = [
  {
    id: "out-101",
    clientId: "1",
    clientName: "Sarah Jenkins",
    clientInitials: "SJ",
    avatarBg: "bg-purple-100 text-purple-700",
    assessmentName: "Anxiety & Worry",
    assessmentCode: "GAD-7",
    sessionMilestone: 12,
    previousScore: 16,
    currentScore: 11,
    maxScore: 21,
    changeValue: -5,
    changeLabel: "-5 points",
    changeDirection: "decreased",
    completedDate: "Today, 2:15 PM",
    therapistNotified: true,
    notifiedAt: "25m ago",
    details: [
      { q: "1. Feeling nervous, anxious or on edge", prev: "Nearly every day (3/3)", curr: "Several days (1/3)" },
      { q: "2. Not being able to stop or control worrying", prev: "Nearly every day (3/3)", curr: "More than half the days (2/3)" },
      { q: "3. Worrying too much about different things", prev: "More than half the days (2/3)", curr: "Several days (1/3)" },
      { q: "4. Trouble relaxing", prev: "Nearly every day (3/3)", curr: "More than half the days (2/3)" },
      { q: "5. Restlessness", prev: "More than half the days (2/3)", curr: "Several days (1/3)" },
      { q: "6. Becoming easily annoyed or irritable", prev: "Several days (1/3)", curr: "Not at all (0/3)" },
      { q: "7. Feeling afraid as if something awful might happen", prev: "Nearly every day (3/3)", curr: "More than half the days (2/3)" }
    ]
  },
  {
    id: "out-102",
    clientId: "2",
    clientName: "Michael Chen",
    clientInitials: "MC",
    avatarBg: "bg-blue-100 text-blue-700",
    assessmentName: "Mood & Wellbeing",
    assessmentCode: "PHQ-9",
    sessionMilestone: 8,
    previousScore: 18,
    currentScore: 12,
    maxScore: 27,
    changeValue: -6,
    changeLabel: "-6 points",
    changeDirection: "decreased",
    completedDate: "Today, 11:30 AM",
    therapistNotified: true,
    notifiedAt: "1h ago",
    details: [
      { q: "1. Little interest or pleasure in doing things", prev: "Nearly every day (3/3)", curr: "Several days (1/3)" },
      { q: "2. Feeling down, depressed, or hopeless", prev: "Nearly every day (3/3)", curr: "More than half the days (2/3)" },
      { q: "3. Trouble sleeping or sleeping too much", prev: "More than half the days (2/3)", curr: "Several days (1/3)" }
    ]
  },
  {
    id: "out-103",
    clientId: "3",
    clientName: "Emily Rodriguez",
    clientInitials: "ER",
    avatarBg: "bg-emerald-100 text-emerald-700",
    assessmentName: "Post-Traumatic Symptoms",
    assessmentCode: "PCL-5",
    sessionMilestone: 15,
    previousScore: 24,
    currentScore: 24,
    maxScore: 80,
    changeValue: 0,
    changeLabel: "No change",
    changeDirection: "unchanged",
    completedDate: "Yesterday",
    therapistNotified: true,
    notifiedAt: "Yesterday",
    details: [
      { q: "1. Repeated, disturbing memories", prev: "Several days (1/3)", curr: "Several days (1/3)" },
      { q: "2. Avoidance of external reminders", prev: "More than half the days (2/3)", curr: "More than half the days (2/3)" }
    ]
  },
  {
    id: "out-104",
    clientId: "4",
    clientName: "David Kim",
    clientInitials: "DK",
    avatarBg: "bg-indigo-100 text-indigo-700",
    assessmentName: "Anxiety & Worry",
    assessmentCode: "GAD-7",
    sessionMilestone: 2,
    previousScore: 16,
    currentScore: 14,
    maxScore: 21,
    changeValue: -2,
    changeLabel: "-2 points",
    changeDirection: "decreased",
    completedDate: "Jul 20, 2026",
    therapistNotified: true,
    notifiedAt: "Jul 20",
    details: [
      { q: "1. Feeling nervous, anxious or on edge", prev: "Nearly every day (3/3)", curr: "More than half the days (2/3)" }
    ]
  },
  {
    id: "out-105",
    clientId: "5",
    clientName: "Jessica Taylor",
    clientInitials: "JT",
    avatarBg: "bg-rose-100 text-rose-700",
    assessmentName: "Panic & Agoraphobia",
    assessmentCode: "GAD-7",
    sessionMilestone: 16,
    previousScore: 12,
    currentScore: 3,
    maxScore: 21,
    changeValue: -9,
    changeLabel: "-9 points",
    changeDirection: "decreased",
    completedDate: "Graduated",
    therapistNotified: true,
    notifiedAt: "Completed",
  }
];

export const INITIAL_NOTIFICATIONS: OutcomeNotification[] = [
  {
    id: "notif-out-1",
    outcomeId: "out-101",
    clientName: "Sarah Jenkins",
    assessmentName: "Anxiety & Worry",
    previousScore: 16,
    currentScore: 11,
    changeLabel: "-5 points",
    changeValue: -5,
    sessionMilestone: 12,
    completedDate: "after Session 12",
    timestamp: "25m ago",
    read: false,
  },
  {
    id: "notif-out-2",
    outcomeId: "out-102",
    clientName: "Michael Chen",
    assessmentName: "Mood & Wellbeing",
    previousScore: 18,
    currentScore: 12,
    changeLabel: "-6 points",
    changeValue: -6,
    sessionMilestone: 8,
    completedDate: "after Session 8",
    timestamp: "1h ago",
    read: false,
  },
  {
    id: "notif-out-3",
    outcomeId: "out-103",
    clientName: "Emily Rodriguez",
    assessmentName: "Post-Traumatic Symptoms",
    previousScore: 24,
    currentScore: 24,
    changeLabel: "No change",
    changeValue: 0,
    sessionMilestone: 15,
    completedDate: "after Session 15",
    timestamp: "Yesterday",
    read: true,
  }
];

// In-memory state listeners
type Listener = () => void;
let globalOutcomes: OutcomeRecord[] = [...INITIAL_OUTCOMES];
let globalNotifications: OutcomeNotification[] = [...INITIAL_NOTIFICATIONS];
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function calculateOutcome(params: {
  clientId: string;
  clientName: string;
  clientInitials: string;
  avatarBg?: string;
  assessmentName: string;
  assessmentCode: string;
  sessionMilestone: number;
  previousScore: number;
  currentScore: number;
  maxScore: number;
}): { outcome: OutcomeRecord; notification: OutcomeNotification } {
  const {
    clientId,
    clientName,
    clientInitials,
    avatarBg = "bg-purple-100 text-purple-700",
    assessmentName,
    assessmentCode,
    sessionMilestone,
    previousScore,
    currentScore,
    maxScore,
  } = params;

  const diff = currentScore - previousScore;
  let changeLabel = "No change";
  let changeDirection: "decreased" | "increased" | "unchanged" = "unchanged";

  if (diff < 0) {
    changeLabel = `${diff} points`;
    changeDirection = "decreased";
  } else if (diff > 0) {
    changeLabel = `+${diff} points`;
    changeDirection = "increased";
  }

  const outcomeId = `out-${Date.now()}`;
  const notifId = `notif-${Date.now()}`;

  // ALWAYS dispatch an outcome notification to the therapist panel upon 3-session milestone assessment completion,
  // regardless of whether score decreased, increased, or stayed unchanged.
  const outcome: OutcomeRecord = {
    id: outcomeId,
    clientId,
    clientName,
    clientInitials,
    avatarBg,
    assessmentName,
    assessmentCode,
    sessionMilestone,
    previousScore,
    currentScore,
    maxScore,
    changeValue: diff,
    changeLabel,
    changeDirection,
    completedDate: `Just completed after Session ${sessionMilestone}`,
    therapistNotified: true, // Always true
    notifiedAt: "Just now",
  };

  const notification: OutcomeNotification = {
    id: notifId,
    outcomeId,
    clientName,
    assessmentName,
    previousScore,
    currentScore,
    changeLabel,
    changeValue: diff,
    sessionMilestone,
    completedDate: `after Session ${sessionMilestone}`,
    timestamp: "Just now",
    read: false,
  };

  globalOutcomes = [outcome, ...globalOutcomes];
  globalNotifications = [notification, ...globalNotifications];
  notifyListeners();

  return { outcome, notification };
}

export function useOutcomeStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const markNotificationRead = (id: string) => {
    globalNotifications = globalNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    notifyListeners();
  };

  const markAllNotificationsRead = () => {
    globalNotifications = globalNotifications.map((n) => ({ ...n, read: true }));
    notifyListeners();
  };

  return {
    outcomes: globalOutcomes,
    notifications: globalNotifications,
    unreadCount: globalNotifications.filter((n) => !n.read).length,
    markNotificationRead,
    markAllNotificationsRead,
    calculateOutcome,
  };
}
