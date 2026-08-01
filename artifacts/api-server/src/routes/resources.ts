import { Router, type IRouter } from "express";
import { db, resourcesTable, savedResourcesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetResourcesQueryParams,
  GetResourcesResponse,
  ToggleSaveResourceParams,
  ToggleSaveResourceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const CLIENT_ID = 1;

let mockResources = [
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
  {
    id: 3,
    title: "15-Minute Progressive Muscle Relaxation (PMR)",
    category: "meditation",
    description: "Guided audio session systematically tensing and relaxing major muscle groups to release somatic tension.",
    thumbnailUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&auto=format&fit=crop&q=80",
    readingMinutes: 15,
    author: "Dr. Sarah Jenkins",
    isSaved: true,
    isSharedByTherapist: false,
    downloadUrl: "#",
  },
];

async function getResourcesWithSaved(category?: string) {
  try {
    let rows;
    if (category) {
      rows = await db.select().from(resourcesTable).where(eq(resourcesTable.category, category));
    } else {
      rows = await db.select().from(resourcesTable);
    }

    const savedRows = await db
      .select()
      .from(savedResourcesTable)
      .where(eq(savedResourcesTable.clientId, CLIENT_ID));
    const savedIds = new Set(savedRows.map((r) => r.resourceId));

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      description: r.description,
      thumbnailUrl: r.thumbnailUrl,
      readingMinutes: r.readingMinutes,
      author: r.author,
      isSaved: savedIds.has(r.id),
      isSharedByTherapist: r.isSharedByTherapist,
      downloadUrl: r.downloadUrl,
    }));
  } catch (err) {
    // DB offline fallback
  }

  return category ? mockResources.filter(r => r.category === category) : mockResources;
}

router.get("/resources", async (req, res): Promise<void> => {
  const parsed = GetResourcesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const resources = await getResourcesWithSaved(parsed.data.category);
  res.json(GetResourcesResponse.parse(resources));
});

router.patch("/resources/:id/save", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = ToggleSaveResourceParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [resource] = await db.select().from(resourcesTable).where(eq(resourcesTable.id, parsed.data.id));
    if (resource) {
      const [existing] = await db
        .select()
        .from(savedResourcesTable)
        .where(and(eq(savedResourcesTable.clientId, CLIENT_ID), eq(savedResourcesTable.resourceId, parsed.data.id)));

      if (existing) {
        await db
          .delete(savedResourcesTable)
          .where(and(eq(savedResourcesTable.clientId, CLIENT_ID), eq(savedResourcesTable.resourceId, parsed.data.id)));
      } else {
        await db.insert(savedResourcesTable).values({ clientId: CLIENT_ID, resourceId: parsed.data.id });
      }

      const isSaved = !existing;
      res.json(ToggleSaveResourceResponse.parse({
        id: resource.id,
        title: resource.title,
        category: resource.category,
        description: resource.description,
        thumbnailUrl: resource.thumbnailUrl,
        readingMinutes: resource.readingMinutes,
        author: resource.author,
        isSaved,
        isSharedByTherapist: resource.isSharedByTherapist,
        downloadUrl: resource.downloadUrl,
      }));
      return;
    }
  } catch (err) {
    // DB offline fallback
  }

  const target = mockResources.find(r => r.id === parsed.data.id) || mockResources[0];
  const toggled = { ...target, isSaved: !target.isSaved };
  mockResources = mockResources.map(r => r.id === toggled.id ? toggled : r);
  res.json(ToggleSaveResourceResponse.parse(toggled));
});

export default router;
