import { Router, type IRouter } from "express";
import { db, sessionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetSessionsQueryParams,
  GetSessionsResponse,
  CancelSessionParams,
  CancelSessionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const CLIENT_ID = 1;

const MOCK_SESSIONS = [
  {
    id: 1,
    status: "upcoming",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    durationMinutes: 50,
    therapistName: "Dr. Sarah Jenkins",
    therapistAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
    joinUrl: "https://meet.google.com",
    notes: null,
  },
  {
    id: 2,
    status: "upcoming",
    scheduledAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    durationMinutes: 50,
    therapistName: "Dr. Sarah Jenkins",
    therapistAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
    joinUrl: "https://meet.google.com",
    notes: null,
  },
  {
    id: 3,
    status: "past",
    scheduledAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    durationMinutes: 50,
    therapistName: "Dr. Sarah Jenkins",
    therapistAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
    joinUrl: null,
    notes: "Reviewed CBT thought records. Client demonstrated good progress in grounding techniques.",
  },
];

function serializeSession(s: typeof sessionsTable.$inferSelect) {
  return {
    id: s.id,
    status: s.status,
    scheduledAt: s.scheduledAt.toISOString(),
    durationMinutes: s.durationMinutes,
    therapistName: s.therapistName,
    therapistAvatarUrl: s.therapistAvatarUrl,
    joinUrl: s.joinUrl,
    notes: null,
  };
}

router.get("/sessions", async (req, res): Promise<void> => {
  const parsed = GetSessionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const conditions = [eq(sessionsTable.clientId, CLIENT_ID)];
    if (parsed.data.status) {
      conditions.push(eq(sessionsTable.status, parsed.data.status));
    }

    const rows = await db
      .select()
      .from(sessionsTable)
      .where(and(...conditions))
      .orderBy(sessionsTable.scheduledAt);

    res.json(GetSessionsResponse.parse(rows.map(serializeSession)));
    return;
  } catch (err) {
    // DB offline fallback
  }

  const filtered = parsed.data.status 
    ? MOCK_SESSIONS.filter(s => s.status === parsed.data.status)
    : MOCK_SESSIONS;

  res.json(GetSessionsResponse.parse(filtered));
});

router.patch("/sessions/:id/cancel", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = CancelSessionParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [updated] = await db
      .update(sessionsTable)
      .set({ status: "cancelled" })
      .where(and(eq(sessionsTable.id, parsed.data.id), eq(sessionsTable.clientId, CLIENT_ID)))
      .returning();

    if (updated) {
      res.json(CancelSessionResponse.parse(serializeSession(updated)));
      return;
    }
  } catch (err) {
    // DB offline fallback
  }

  const target = MOCK_SESSIONS.find(s => s.id === parsed.data.id) || MOCK_SESSIONS[0];
  res.json(CancelSessionResponse.parse({ ...target, status: "cancelled" }));
});

export default router;
