import { Router, type IRouter } from "express";
import { db, messagesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  GetMessagesResponse,
  SendMessageBody,
  SendMessageResponse,
  MarkMessageReadParams,
  MarkMessageReadResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const CLIENT_ID = 1;

let mockMessages = [
  {
    id: 1,
    type: "text",
    senderId: 2,
    senderName: "Dr. Sarah Jenkins",
    senderAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
    content: "Hi Alex! How are you feeling after our last session on Tuesday?",
    sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isRead: true
  },
  {
    id: 2,
    type: "text",
    senderId: 1,
    senderName: "Alex Morgan",
    senderAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    content: "Hi Dr. Jenkins, I've been doing the breathing exercises whenever I notice tension. It really helped before my presentation yesterday!",
    sentAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    isRead: true
  },
  {
    id: 3,
    type: "text",
    senderId: 2,
    senderName: "Dr. Sarah Jenkins",
    senderAvatarUrl: "https://images.unsplash.com/photo-1594824813566-78a9c3756b57?w=150&auto=format&fit=crop&q=80",
    content: "That's fantastic news! Great work applying the techniques in real-world scenarios. We'll build on that success in our upcoming session.",
    sentAt: new Date(Date.now() - 86400000 + 7200000).toISOString(),
    isRead: false
  }
];

function serializeMessage(m: typeof messagesTable.$inferSelect) {
  return {
    id: m.id,
    type: m.type,
    senderId: m.senderId,
    senderName: m.senderName,
    senderAvatarUrl: m.senderAvatarUrl,
    content: m.content,
    sentAt: m.sentAt.toISOString(),
    isRead: m.isRead,
  };
}

router.get("/messages", async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.clientId, CLIENT_ID))
      .orderBy(desc(messagesTable.sentAt));

    res.json(GetMessagesResponse.parse(rows.map(serializeMessage)));
    return;
  } catch (err) {
    // DB offline fallback
  }

  res.json(GetMessagesResponse.parse(mockMessages));
});

router.post("/messages", async (req, res): Promise<void> => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [msg] = await db
      .insert(messagesTable)
      .values({
        clientId: CLIENT_ID,
        type: "therapist",
        senderId: CLIENT_ID,
        senderName: "You",
        senderAvatarUrl: null,
        content: parsed.data.content,
        sentAt: new Date(),
        isRead: true,
      })
      .returning();

    if (msg) {
      res.status(201).json(SendMessageResponse.parse(serializeMessage(msg)));
      return;
    }
  } catch (err) {
    // DB offline fallback
  }

  const newMsg = {
    id: mockMessages.length + 1,
    type: "text",
    senderId: 1,
    senderName: "Alex Morgan",
    senderAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    content: parsed.data.content,
    sentAt: new Date().toISOString(),
    isRead: true
  };
  mockMessages.push(newMsg);
  res.status(201).json(SendMessageResponse.parse(newMsg));
});

router.patch("/messages/:id/read", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = MarkMessageReadParams.safeParse({ id: parseInt(raw, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [updated] = await db
      .update(messagesTable)
      .set({ isRead: true })
      .where(and(eq(messagesTable.id, parsed.data.id), eq(messagesTable.clientId, CLIENT_ID)))
      .returning();

    if (updated) {
      res.json(MarkMessageReadResponse.parse(serializeMessage(updated)));
      return;
    }
  } catch (err) {
    // DB offline fallback
  }

  const target = mockMessages.find(m => m.id === parsed.data.id) || mockMessages[0];
  const updatedMsg = { ...target, isRead: true };
  res.json(MarkMessageReadResponse.parse(updatedMsg));
});

export default router;
