import { pgTable, text, serial, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Export auth models so they are included in the schema
export * from "./models/auth";
import { users } from "./models/auth";

// === AGENT ENUM ===
export const AGENTS = ["chatgpt", "claude", "gemini", "llama", "other"] as const;
export type Agent = typeof AGENTS[number];

// === TABLE DEFINITIONS ===
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  agent: text("agent").notNull(), // Validated via Zod schema
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SCHEMAS ===
export const insertChatSchema = createInsertSchema(chats).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  agent: z.enum(AGENTS),
  title: z.string().min(1, "Title is required").max(500),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional().default([]),
});

// === EXPLICIT API TYPES ===
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type CreateChatRequest = InsertChat;
export type UpdateChatRequest = Partial<InsertChat>;

export type ChatResponse = Chat;
export type ChatsListResponse = Chat[];
