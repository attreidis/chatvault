import { pgTable, text, serial, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth models so they are included in the schema
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(), // The full chat log or content
  agent: text("agent").notNull(), // e.g. 'chatgpt', 'claude', 'gemini'
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SCHEMAS ===
export const insertChatSchema = createInsertSchema(chats).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});

// === EXPLICIT API TYPES ===
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type CreateChatRequest = InsertChat;
export type UpdateChatRequest = Partial<InsertChat>;

export type ChatResponse = Chat;
export type ChatsListResponse = Chat[];
