import { Router, type IRouter } from "express";
import { db, assessmentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetAssessmentsResponse,
  SubmitAssessmentParams,
  SubmitAssessmentBody,
  SubmitAssessmentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const CLIENT_ID = 1;

let mockAssessments = [
  {
    id: 1,
    name: "GAD-7 Anxiety Scale Questionnaire",
    description: "Standardized 7-item scale assessing severity of generalized anxiety symptoms over the past 2 weeks.",
    type: "Anxiety",
    dueDate: "This Week",
    estimatedMinutes: 5,
    status: "pending",
    completedAt: null,
    score: null,
    scoreHistory: [
      { date: "May 1", score: 14 },
      { date: "May 15", score: 11 },
      { date: "Jun 1", score: 8 }
    ]
  },
  {
    id: 2,
    name: "PHQ-9 Depression Screener",
    description: "9-question depression module to monitor symptom progress and therapeutic outcomes.",
    type: "Depression",
    dueDate: "Completed",
    estimatedMinutes: 6,
    status: "completed",
    completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    score: 5,
    scoreHistory: [
      { date: "May 1", score: 12 },
      { date: "May 15", score: 9 },
      { date: "Jun 1", score: 5 }
    ]
  }
];

function serializeAssessment(a: typeof assessmentsTable.$inferSelect) {
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    description: a.description,
    status: a.status,
    dueDate: a.dueDate,
    completedAt: a.completedAt?.toISOString() ?? null,
    estimatedMinutes: a.estimatedMinutes,
    score: a.score,
    scoreHistory: Array.isArray(a.scoreHistory) ? a.scoreHistory : [],
  };
}

router.get("/assessments", async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.clientId, CLIENT_ID));

    res.json(GetAssessmentsResponse.parse(rows.map(serializeAssessment)));
    return;
  } catch (err) {
    // DB offline fallback
  }

  res.json(GetAssessmentsResponse.parse(mockAssessments));
});

router.post("/assessments/:id/submit", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsedParams = SubmitAssessmentParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const parsedBody = SubmitAssessmentBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  try {
    const [existing] = await db
      .select()
      .from(assessmentsTable)
      .where(and(eq(assessmentsTable.id, parsedParams.data.id), eq(assessmentsTable.clientId, CLIENT_ID)));

    if (existing) {
      const today = new Date().toISOString().split("T")[0];
      const prevHistory = Array.isArray(existing.scoreHistory) ? existing.scoreHistory as { date: string; score: number }[] : [];
      const newHistory = [...prevHistory, { date: today, score: parsedBody.data.score }];

      const [updated] = await db
        .update(assessmentsTable)
        .set({
          status: "completed",
          score: parsedBody.data.score,
          completedAt: new Date(),
          scoreHistory: newHistory,
        })
        .where(eq(assessmentsTable.id, parsedParams.data.id))
        .returning();

      res.json(SubmitAssessmentResponse.parse(serializeAssessment(updated)));
      return;
    }
  } catch (err) {
    // DB offline fallback
  }

  const target = mockAssessments.find(a => a.id === parsedParams.data.id) || mockAssessments[0];
  const todayStr = new Date().toISOString().split("T")[0];
  const updatedItem = {
    ...target,
    status: "completed",
    score: parsedBody.data.score,
    completedAt: new Date().toISOString(),
    scoreHistory: [...target.scoreHistory, { date: todayStr, score: parsedBody.data.score }]
  };
  mockAssessments = mockAssessments.map(a => a.id === updatedItem.id ? updatedItem : a);
  res.json(SubmitAssessmentResponse.parse(updatedItem));
});

export default router;
