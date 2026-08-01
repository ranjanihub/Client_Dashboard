import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  clientsTable,
  sessionsTable,
  activitiesTable,
  resourcesTable,
  messagesTable,
  savedResourcesTable,
} from "@workspace/db";
import { desc, eq, and, gte } from "drizzle-orm";
import { GetDashboardResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const CLIENT_ID = 1;

const MOCK_DASHBOARD = {
  clientName: "Alex Morgan",
  activitiesCompleted: 14,
  currentStreak: 7,
  goalsAchieved: 5,
  upcomingSession: {
    id: 1,
    status: "upcoming",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    durationMinutes: 50,
    therapistName: "Dr. Sarah Jenkins",
    therapistAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
    joinUrl: "https://meet.google.com",
    notes: null,
  },
  todayTasks: [
    {
      id: 1,
      title: "Morning Mindfulness Meditation",
      category: "mindfulness",
      description: "10-minute guided breathing session focusing on awareness of breath and physical sensation grounding.",
      dueDate: "Today",
      estimatedMinutes: 10,
      completionPercent: 0,
      difficulty: "Easy",
      status: "pending",
      reflection: null,
      completedAt: null,
    },
    {
      id: 2,
      title: "CBT Thought Record Entry",
      category: "cbt",
      description: "Document recent anxiety trigger and write a balanced, rational reframe using the 5-column technique.",
      dueDate: "Today",
      estimatedMinutes: 15,
      completionPercent: 50,
      difficulty: "Medium",
      status: "pending",
      reflection: null,
      completedAt: null,
    },
    {
      id: 3,
      title: "Evening Gratitude Journaling",
      category: "gratitude",
      description: "Write down 3 things you felt grateful for today and reflect on why they mattered.",
      dueDate: "Today",
      estimatedMinutes: 8,
      completionPercent: 0,
      difficulty: "Easy",
      status: "pending",
      reflection: null,
      completedAt: null,
    },
  ],
  recentMessage: {
    id: 3,
    type: "text",
    senderId: 2,
    senderName: "Dr. Sarah Jenkins",
    senderAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
    content: "That's fantastic news! Great work applying the techniques in real-world scenarios. We'll build on that success in our upcoming session.",
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
  },
  sharedResources: [
    {
      id: 1,
      title: "Understanding Panic & Somatic Grounding Techniques",
      category: "article",
      description: "Practical step-by-step physical grounding tools to de-escalate panic attacks and physical hyperarousal.",
      thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80",
      readingMinutes: 5,
      author: "Dr. Sarah Jenkins",
      isSaved: true,
      isSharedByTherapist: true,
      downloadUrl: "#",
    },
    {
      id: 2,
      title: "Cognitive Distortions Reference Guide & Worksheet",
      category: "worksheet",
      description: "Identify and reframe the 10 most common unhelpful thinking habits with real-life examples.",
      thumbnailUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=80",
      readingMinutes: 8,
      author: "Hexpertify Clinical Team",
      isSaved: false,
      isSharedByTherapist: true,
      downloadUrl: "#",
    },
  ],
};

router.get("/dashboard", async (req, res): Promise<void> => {
  try {
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, CLIENT_ID));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingSessions = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.clientId, CLIENT_ID), eq(sessionsTable.status, "upcoming")))
      .orderBy(sessionsTable.scheduledAt)
      .limit(1);

    const todayTasks = await db
      .select()
      .from(activitiesTable)
      .where(and(eq(activitiesTable.clientId, CLIENT_ID), eq(activitiesTable.status, "pending")))
      .limit(5);

    const recentMessage = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.clientId, CLIENT_ID))
      .orderBy(desc(messagesTable.sentAt))
      .limit(1);

    const completedCount = await db
      .select()
      .from(activitiesTable)
      .where(and(eq(activitiesTable.clientId, CLIENT_ID), eq(activitiesTable.status, "completed")));

    const allResources = await db.select().from(resourcesTable).limit(4);
    const savedRows = await db.select().from(savedResourcesTable).where(eq(savedResourcesTable.clientId, CLIENT_ID));
    const savedIds = new Set(savedRows.map((r) => r.resourceId));
    const resources = allResources.map((r) => ({ ...r, isSaved: savedIds.has(r.id), specializations: undefined, languages: undefined }));

    const upcomingSession = upcomingSessions[0] || null;

    const response = GetDashboardResponse.parse({
      clientName: client?.name ?? "Client",
      activitiesCompleted: completedCount.length,
      currentStreak: 7,
      goalsAchieved: 3,
      upcomingSession: upcomingSession
        ? {
            id: upcomingSession.id,
            status: upcomingSession.status,
            scheduledAt: upcomingSession.scheduledAt.toISOString(),
            durationMinutes: upcomingSession.durationMinutes,
            therapistName: upcomingSession.therapistName,
            therapistAvatarUrl: upcomingSession.therapistAvatarUrl,
            joinUrl: upcomingSession.joinUrl,
            notes: null,
          }
        : null,
      todayTasks: todayTasks.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        description: a.description,
        dueDate: a.dueDate,
        estimatedMinutes: a.estimatedMinutes,
        completionPercent: a.completionPercent,
        difficulty: a.difficulty,
        status: a.status,
        reflection: a.reflection,
        completedAt: a.completedAt?.toISOString() ?? null,
      })),
      recentMessage: recentMessage[0]
        ? {
            id: recentMessage[0].id,
            type: recentMessage[0].type,
            senderId: recentMessage[0].senderId,
            senderName: recentMessage[0].senderName,
            senderAvatarUrl: recentMessage[0].senderAvatarUrl,
            content: recentMessage[0].content,
            sentAt: recentMessage[0].sentAt.toISOString(),
            isRead: recentMessage[0].isRead,
          }
        : null,
      sharedResources: resources.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        readingMinutes: r.readingMinutes,
        author: r.author,
        isSaved: r.isSaved,
        isSharedByTherapist: r.isSharedByTherapist,
        downloadUrl: r.downloadUrl,
      })),
    });

    res.json(response);
    return;
  } catch (err) {
    // DB offline fallback
  }

  res.json(GetDashboardResponse.parse(MOCK_DASHBOARD));
});

export default router;
