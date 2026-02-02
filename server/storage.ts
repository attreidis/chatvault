import { chats, type Chat, type InsertChat, type UpdateChatRequest } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getChats(userId: string): Promise<Chat[]>;
  getChat(id: number): Promise<Chat | undefined>;
  createChat(userId: string, chat: InsertChat): Promise<Chat>;
  updateChat(id: number, updates: UpdateChatRequest): Promise<Chat>;
  deleteChat(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getChats(userId: string): Promise<Chat[]> {
    return await db.select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt));
  }

  async getChat(id: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat;
  }

  async createChat(userId: string, insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values({ ...insertChat, userId }).returning();
    return chat;
  }

  async updateChat(id: number, updates: UpdateChatRequest): Promise<Chat> {
    const [updated] = await db.update(chats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chats.id, id))
      .returning();
    return updated;
  }

  async deleteChat(id: number): Promise<void> {
    await db.delete(chats).where(eq(chats.id, id));
  }
}

export const storage = new DatabaseStorage();
