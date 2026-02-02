import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  tags: z.array(
    z.string().trim().min(1).max(50)
  ).max(50).default([]).transform(tags => [...new Set(tags)]),
});

// Explicit update schema - controlled fields + non-empty check
export const updateChatSchema = z.object({
  title: z.string().min(1, "Title is required").max(500).optional(),
  content: z.string().min(1, "Content is required").optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(50)
    .transform(tags => [...new Set(tags)]).optional(),
  agent: z.enum(AGENTS).optional(),
}).strict().refine(obj => Object.keys(obj).length > 0, {
  message: "At least one field must be provided",
});

// === EXPLICIT API TYPES ===
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type CreateChatRequest = InsertChat;
export type UpdateChatRequest = z.infer<typeof updateChatSchema>;

export type ChatResponse = Chat;
export type ChatsListResponse = Chat[];
