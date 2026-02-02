import { chats, type Chat, type InsertChat, type UpdateChatRequest } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getChats(userId: string): Promise<Chat[]>;
  getChat(userId: string, id: number): Promise<Chat | undefined>;
  createChat(userId: string, chat: InsertChat): Promise<Chat>;
  updateChat(userId: string, id: number, updates: UpdateChatRequest): Promise<Chat | undefined>;
  deleteChat(userId: string, id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getChats(userId: string): Promise<Chat[]> {
    return await db.select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt));
  }

  // User-scoped query - only returns chat if owned by user
  async getChat(userId: string, id: number): Promise<Chat | undefined> {
    const [chat] = await db.select()
      .from(chats)
      .where(and(eq(chats.id, id), eq(chats.userId, userId)));
    return chat;
  }

  async createChat(userId: string, insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values({ ...insertChat, userId }).returning();
    return chat;
  }

  // User-scoped update - only updates if owned by user
  async updateChat(userId: string, id: number, updates: UpdateChatRequest): Promise<Chat | undefined> {
    const [updated] = await db.update(chats)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(chats.id, id), eq(chats.userId, userId)))
      .returning();
    return updated;
  }

  // User-scoped delete - only deletes if owned by user
  async deleteChat(userId: string, id: number): Promise<boolean> {
    const result = await db.delete(chats)
      .where(and(eq(chats.id, id), eq(chats.userId, userId)))
      .returning({ id: chats.id });
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
