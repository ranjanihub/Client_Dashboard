import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetClientProfileResponse,
  UpdateClientProfileBody,
  UpdateClientProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const CLIENT_ID = 1;

let mockClientState = {
  id: 1,
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 234-5678",
  age: 29,
  gender: "Female",
  preferredLanguage: "English",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  timezone: "America/New_York",
};

router.get("/client/me", async (req, res): Promise<void> => {
  try {
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, CLIENT_ID));
    if (client) {
      res.json(GetClientProfileResponse.parse({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        age: client.age,
        gender: client.gender,
        preferredLanguage: client.preferredLanguage,
        avatarUrl: client.avatarUrl,
        timezone: client.timezone,
      }));
      return;
    }
  } catch (err) {
    // DB offline fallback
  }
  res.json(GetClientProfileResponse.parse(mockClientState));
});

router.patch("/client/me", async (req, res): Promise<void> => {
  const parsed = UpdateClientProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [updated] = await db
      .update(clientsTable)
      .set(parsed.data)
      .where(eq(clientsTable.id, CLIENT_ID))
      .returning();
    if (updated) {
      res.json(UpdateClientProfileResponse.parse({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        age: updated.age,
        gender: updated.gender,
        preferredLanguage: updated.preferredLanguage,
        avatarUrl: updated.avatarUrl,
        timezone: updated.timezone,
      }));
      return;
    }
  } catch (err) {
    // DB offline fallback
  }
  mockClientState = { ...mockClientState, ...parsed.data };
  res.json(UpdateClientProfileResponse.parse(mockClientState));
});

export default router;
