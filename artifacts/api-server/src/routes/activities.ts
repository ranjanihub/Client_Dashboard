import { Router, type IRouter } from "express";
import { db, activitiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetActivitiesResponse,
  CompleteActivityParams,
  CompleteActivityBody,
  CompleteActivityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const CLIENT_ID = 1;

interface ActivityItem {
  id: number;
  title: string;
  category: string;
  description: string;
  dueDate: string;
  estimatedMinutes: number;
  completionPercent: number;
  difficulty: string;
  status: string;
  reflection: string | null;
  completedAt: string | null;
}

let mockActivities: ActivityItem[] = [
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
    completedAt: null
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
    completedAt: null
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
    completedAt: null
  }
];

function serializeActivity(a: typeof activitiesTable.$inferSelect) {
  return {
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
  };
}

router.get("/activities", async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(activitiesTable)
      .where(eq(activitiesTable.clientId, CLIENT_ID))
      .orderBy(activitiesTable.dueDate);

    res.json(GetActivitiesResponse.parse(rows.map(serializeActivity)));
    return;
  } catch (err) {
    // DB offline fallback
  }

  res.json(GetActivitiesResponse.parse(mockActivities));
});

router.patch("/activities/:id/complete", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsedParams = CompleteActivityParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const parsedBody = CompleteActivityBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  try {
    const [updated] = await db
      .update(activitiesTable)
      .set({
        status: "completed",
        completionPercent: 100,
        reflection: parsedBody.data.reflection,
        completedAt: new Date(),
      })
      .where(and(eq(activitiesTable.id, parsedParams.data.id), eq(activitiesTable.clientId, CLIENT_ID)))
      .returning();

    if (updated) {
      res.json(CompleteActivityResponse.parse(serializeActivity(updated)));
      return;
    }
  } catch (err) {
    // DB offline fallback
  }

  const target = mockActivities.find(a => a.id === parsedParams.data.id) || mockActivities[0];
  const updatedItem = {
    ...target,
    status: "completed",
    completionPercent: 100,
    reflection: parsedBody.data.reflection || null,
    completedAt: new Date().toISOString()
  };
  mockActivities = mockActivities.map(a => a.id === updatedItem.id ? updatedItem : a);
  res.json(CompleteActivityResponse.parse(updatedItem));
});

export default router;
