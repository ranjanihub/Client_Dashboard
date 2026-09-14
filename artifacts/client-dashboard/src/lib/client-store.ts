import { getClientAuth, ClientAuthUser } from "./auth";

export interface SessionItem {
  id: number | string;
  status: "upcoming" | "past" | "cancelled";
  scheduledAt: string;
  durationMinutes: number;
  therapistName: string;
  therapistAvatarUrl: string;
  therapistTitle?: string;
  joinUrl?: string | null;
  notes?: string | null;
  clientName?: string;
  clientEmail?: string;
}

export interface ActivityStoreItem {
  id: number | string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  dueDate: string;
  imageUrl: string;
  status: "pending" | "completed";
  instructions?: string;
  completedAt?: string | null;
  assignedTo?: string[];
  frequency?: string;
  timeOfDay?: string;
}

export interface MessageItem {
  id: number | string;
  type: string;
  senderRole?: 'client' | 'therapist';
  senderId: number | string;
  senderName: string;
  senderAvatarUrl: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface AssessmentResult {
  id: number | string;
  type: "GAD-7" | "PHQ-9" | "CBT" | "OQ-45";
  title: string;
  score: number;
  maxScore: number;
  severity: "Minimal" | "Mild" | "Moderate" | "Severe";
  completedAt: string;
  notes?: string;
}

function getUserKey(prefix: string): string {
  const user = getClientAuth();
  const userIdentifier = user?.email || user?.id || "default_client";
  return `${prefix}_${userIdentifier.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

// ----------------------------------------------------
// 1. SESSIONS STORE
// ----------------------------------------------------
export function getUserSessions(): SessionItem[] {
  const key = getUserKey("hexpertify_sessions");
  const user = getClientAuth();
  const clientEmail = (user?.email || "").toLowerCase();
  const clientId = user?.id || "";

  // Always fetch latest live bookings from MongoDB Atlas
  fetch('/api/bookings')
    .then((res) => res.json())
    .then((data) => {
      const raw = Array.isArray(data?.bookings) ? data.bookings : Array.isArray(data) ? data : [];
      if (raw.length > 0) {
        // If user email is present, match by email or id, or return all client sessions
        const matched = clientEmail
          ? raw.filter((b: any) => 
              (b.clientEmail && b.clientEmail.toLowerCase() === clientEmail) ||
              (b.clientId && b.clientId === clientId) ||
              (b.clientName && user?.name && b.clientName.toLowerCase() === user.name.toLowerCase())
            )
          : raw;

        const isDemo = !clientEmail || clientEmail === "sarah.jenkins@example.com";
        const targetList = (clientEmail && !isDemo) ? matched : (matched.length > 0 ? matched : raw.slice(0, 10));
        const mappedSessions: SessionItem[] = targetList.map((b: any) => {
          const scheduledDate = b.scheduledAt || b.date || new Date().toISOString();
          const isPast = b.status === "COMPLETED" || new Date(scheduledDate).getTime() < Date.now() - 86400000;
          const isCancelled = b.status === "CANCELLED";

          let therapist = b.consultantName || b.therapistName || "";
          let serviceTitle = b.serviceTitle || "";
          if (therapist.includes(" - By ")) {
            const parts = therapist.split(" - By ");
            serviceTitle = serviceTitle || parts[0].trim();
            therapist = parts[1]?.trim() || therapist;
          }
          if (!therapist) {
            therapist = "Assigned Therapist";
          }

          return {
            id: b.id || String(b._id),
            status: isCancelled ? "cancelled" : isPast ? "past" : "upcoming",
            scheduledAt: scheduledDate,
            durationMinutes: b.durationMinutes || b.duration || 50,
            therapistName: therapist,
            therapistAvatarUrl: b.consultantAvatar || b.therapistAvatar || "",
            therapistTitle: serviceTitle || "Individual Clinical Consultation",
            joinUrl: b.meetingLink || "https://meet.google.com/hex-pert-ify",
            notes: `Consultation session for ${b.clientName || 'Client'}.`,
            clientName: b.clientName || user?.name || "Client",
            clientEmail: b.clientEmail || clientEmail
          };
        });

        const prevStr = localStorage.getItem(key);
        const newStr = JSON.stringify(mappedSessions);
        if (prevStr !== newStr) {
          saveUserSessions(mappedSessions);
        }
      }
    })
    .catch(() => {});

  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {}

  return [];
}

export function saveUserSessions(sessions: SessionItem[]): void {
  const key = getUserKey("hexpertify_sessions");
  try {
    localStorage.setItem(key, JSON.stringify(sessions));
    window.dispatchEvent(new Event("client_data_updated"));
  } catch (e) {}
}

export function addUserSession(sessionData: Partial<SessionItem>): SessionItem {
  const sessions = getUserSessions();
  const user = getClientAuth();

  let therapist = sessionData.therapistName || "";
  if (therapist.includes(" - By ")) {
    therapist = therapist.split(" - By ").pop()?.trim() || therapist;
  }
  if (!therapist) {
    therapist = "Assigned Therapist";
  }

  const newSession: SessionItem = {
    id: "session-" + Date.now(),
    status: "upcoming",
    scheduledAt: sessionData.scheduledAt || new Date(Date.now() + 86400000).toISOString(),
    durationMinutes: sessionData.durationMinutes || 50,
    therapistName: therapist,
    therapistAvatarUrl: sessionData.therapistAvatarUrl || user?.assignedTherapistPhoto || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    therapistTitle: sessionData.therapistTitle || "Clinical Mental Health Consultation",
    joinUrl: "https://meet.google.com",
    notes: sessionData.notes || `Virtual appointment booked for ${user?.name || "Client"}.`,
    clientName: user?.name || "Client",
    clientEmail: user?.email || "",
  };

  const updated = [newSession, ...sessions];
  saveUserSessions(updated);

  // Persist session to live MongoDB Atlas bookings collection
  if (user?.email || user?.id) {
    fetch("http://localhost:3000/api/client/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        therapistName: newSession.therapistName,
        date: newSession.scheduledAt,
        type: "video",
      }),
    }).catch(() => {});
  }

  return newSession;
}

export function cancelUserSession(sessionId: number | string): void {
  const sessions = getUserSessions();
  const updated = sessions.map(s => s.id === sessionId ? { ...s, status: "cancelled" as const } : s);
  saveUserSessions(updated);
}

// ----------------------------------------------------
// 2. ACTIVITIES STORE
// ----------------------------------------------------
export function getUserActivities(): ActivityStoreItem[] {
  const key = getUserKey("hexpertify_activities");
  const user = getClientAuth();
  const clientName = user?.name || "Client";

  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {}

  const initialActivities: ActivityStoreItem[] = [
    {
      id: 1,
      title: "Morning Mindfulness Breathing",
      description: "10-minute guided breathing session focusing on present-moment awareness.",
      category: "MINDFULNESS",
      difficulty: "Easy",
      duration: "10 min",
      dueDate: "Today",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      status: "pending",
      instructions: "1. Sit in a comfortable posture.\n2. Inhale gently for 4 counts, hold for 4, and exhale for 6 counts.\n3. Notice physical tension melting away.",
      assignedTo: [clientName],
      frequency: "Daily",
      timeOfDay: "Morning (8:00 AM)"
    },
    {
      id: 2,
      title: "CBT Thought Record Journal",
      description: "Document daily triggers and practice balanced cognitive reframing.",
      category: "CBT",
      difficulty: "Medium",
      duration: "15 min",
      dueDate: "Today",
      imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
      status: "pending",
      instructions: "1. Identify the automatic negative thought.\n2. Write down objective evidence.\n3. Formulate a compassionate reframe.",
      assignedTo: [clientName],
      frequency: "2-3 Times / Week",
      timeOfDay: "Evening (7:00 PM)"
    },
    {
      id: 3,
      title: "Daily Gratitude Reflection",
      description: "List 3 specific things you appreciate today to boost positive emotional valence.",
      category: "GRATITUDE",
      difficulty: "Easy",
      duration: "5 min",
      dueDate: "Today",
      imageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80",
      status: "completed",
      completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      instructions: "Write down 3 moments from today that brought you peace or joy.",
      assignedTo: [clientName],
      frequency: "Daily",
      timeOfDay: "Before Bed (10:00 PM)"
    },
    {
      id: 4,
      title: "4-7-8 Somatic Calming Exercise",
      description: "Regulate nervous system arousal with vagal nerve stimulation.",
      category: "BREATHING",
      difficulty: "Easy",
      duration: "8 min",
      dueDate: "Tomorrow",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      status: "pending",
      instructions: "Inhale for 4 seconds, hold for 7 seconds, exhale audibly for 8 seconds.",
      assignedTo: [clientName],
      frequency: "Daily",
      timeOfDay: "Morning (8:00 AM)"
    }
  ];

  saveUserActivities(initialActivities);
  return initialActivities;
}

export function saveUserActivities(activities: ActivityStoreItem[]): void {
  const key = getUserKey("hexpertify_activities");
  try {
    localStorage.setItem(key, JSON.stringify(activities));
    window.dispatchEvent(new Event("client_data_updated"));
  } catch (e) {}
}

export function toggleUserActivity(activityId: number | string): void {
  const activities = getUserActivities();
  const updated: ActivityStoreItem[] = activities.map(a => {
    if (a.id === activityId) {
      const isCompleted = a.status === "completed";
      return {
        ...a,
        status: (isCompleted ? "pending" : "completed") as "pending" | "completed",
        completedAt: isCompleted ? null : new Date().toISOString()
      };
    }
    return a;
  });
  saveUserActivities(updated);
}

// ----------------------------------------------------
// 3. MESSAGES STORE
// ----------------------------------------------------
export function getUserMessages(): MessageItem[] {
  const key = getUserKey("hexpertify_messages");
  const user = getClientAuth();
  const clientName = user?.name || "Client";
  const clientEmail = (user?.email || "").toLowerCase();
  const clientAvatar = user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  // Live fetch messages from MongoDB Atlas
  if (clientEmail) {
    fetch(`/api/messages?clientEmail=${encodeURIComponent(clientEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data?.messages && Array.isArray(data.messages)) {
          const assignedConsultant = data.consultant;
          const mapped: MessageItem[] = data.messages.map((m: any) => {
            const isClient = (
              m.senderRole === 'client' || 
              m.sender === 'client' || 
              m.senderRole === 'user' ||
              m.sender === 'user' ||
              (m.senderEmail && clientEmail && m.senderEmail.toLowerCase().trim() === clientEmail) ||
              (m.senderName && clientName && m.senderName.toLowerCase().trim() === clientName.toLowerCase().trim()) ||
              (m.clientId && user?.id && String(m.clientId) === String(user.id))
            );
            const consultantName = m.consultantName || m.senderName || assignedConsultant?.name || user?.assignedTherapistName || 'Dr. Evelyn Reed';
            const consultantAvatar = assignedConsultant?.avatarUrl || user?.assignedTherapistPhoto || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80';

            return {
              id: m.id || m._id,
              type: "text",
              senderRole: isClient ? 'client' : 'therapist',
              senderId: isClient ? (user?.id || 'client-1') : (m.consultantId || assignedConsultant?.id || 'doc-1'),
              senderName: isClient ? clientName : consultantName,
              senderAvatarUrl: isClient ? clientAvatar : consultantAvatar,
              content: m.content || m.text || '',
              sentAt: m.createdAt || m.sentAt || new Date().toISOString(),
              isRead: isClient ? true : Boolean(m.read || m.isRead)
            };
          });

          const currentStr = localStorage.getItem(key);
          const newStr = JSON.stringify(mapped);
          if (currentStr !== newStr) {
            saveUserMessages(mapped);
          }
        }
      })
      .catch(() => {});
  }

  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Filter out any stale mock greetings
        const clean = parsed.filter(m => 
          !m.content?.includes('welcome to your personalized care portal') &&
          !m.content?.includes('looking forward to our upcoming consultation session') &&
          !m.content?.includes('grounding exercise has been really helpful')
        );
        return clean;
      }
    }
  } catch (e) {}

  return [];
}

export function saveUserMessages(messages: MessageItem[]): void {
  const key = getUserKey("hexpertify_messages");
  try {
    localStorage.setItem(key, JSON.stringify(messages));
    window.dispatchEvent(new Event("client_data_updated"));
  } catch (e) {}
}

export function sendUserMessage(content: string, consultantInfo?: { consultantId?: string; consultantName?: string; consultantEmail?: string }): MessageItem {
  const messages = getUserMessages();
  const user = getClientAuth();
  const clientName = user?.name || "Client";
  const clientEmail = (user?.email || "").toLowerCase();
  const clientAvatar = user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  const newMsg: MessageItem = {
    id: Date.now(),
    type: "text",
    senderRole: 'client',
    senderId: user?.id || "client-1",
    senderName: clientName,
    senderAvatarUrl: clientAvatar,
    content,
    sentAt: new Date().toISOString(),
    isRead: true,
  };

  const updated = [...messages, newMsg];
  saveUserMessages(updated);

  // Persist live to MongoDB Atlas API
  fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderRole: 'client',
      senderName: clientName,
      senderEmail: clientEmail,
      clientName: clientName,
      clientEmail: clientEmail,
      clientId: user?.id || '',
      consultantId: consultantInfo?.consultantId || user?.assignedTherapistId || '',
      consultantName: consultantInfo?.consultantName || user?.assignedTherapistName || '',
      consultantEmail: consultantInfo?.consultantEmail || '',
      content
    })
  }).catch(() => {});

  return newMsg;
}

// ----------------------------------------------------
// 4. ASSESSMENTS STORE
// ----------------------------------------------------
export function getUserAssessments(): AssessmentResult[] {
  const key = getUserKey("hexpertify_assessments");
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {}

  const initialAssessments: AssessmentResult[] = [
    {
      id: 1,
      type: "GAD-7",
      title: "Generalized Anxiety Disorder Scale",
      score: 8,
      maxScore: 21,
      severity: "Mild",
      completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      notes: "Significant reduction from baseline (16 -> 8 points)."
    },
    {
      id: 2,
      type: "PHQ-9",
      title: "Patient Health Questionnaire",
      score: 6,
      maxScore: 27,
      severity: "Mild",
      completedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      notes: "Mood stability improved with consistent sleep hygiene."
    }
  ];

  saveUserAssessments(initialAssessments);
  return initialAssessments;
}

export function saveUserAssessments(assessments: AssessmentResult[]): void {
  const key = getUserKey("hexpertify_assessments");
  try {
    localStorage.setItem(key, JSON.stringify(assessments));
    window.dispatchEvent(new Event("client_data_updated"));
  } catch (e) {}
}

export function saveUserAssessmentScore(result: Omit<AssessmentResult, "id" | "completedAt">): AssessmentResult {
  const assessments = getUserAssessments();
  const user = getClientAuth();
  const newAssessment: AssessmentResult = {
    ...result,
    id: Date.now(),
    completedAt: new Date().toISOString(),
  };

  const updated = [newAssessment, ...assessments];
  saveUserAssessments(updated);

  // Live save to AssessmentScore collection in MongoDB Atlas
  fetch('/api/assessments/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: result.type,
      assessmentAcronym: result.type,
      title: result.title,
      assessmentTitle: result.title,
      score: result.score,
      totalScore: result.score,
      maxScore: result.maxScore,
      severity: result.severity,
      severityLabel: result.severity,
      clientId: user?.id || '',
      clientName: user?.name || 'Client',
      clientEmail: user?.email || '',
      consultantId: user?.assignedTherapistId || '',
      consultantName: user?.assignedTherapistName || '',
      notes: result.notes || `Completed ${result.type} assessment.`
    })
  }).catch(() => {});

  return newAssessment;
}
