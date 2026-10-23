import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { describeFailure } from "./safe-log";

// Zod schema for validating route params
const idParamSchema = z.coerce.number().int().positive();

// Async handler wrapper - catches errors and forwards to error middleware
const asyncHandler = (fn: (req: any, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Protected Routes - All queries are user-scoped at the DB level
  app.get(api.chats.list.path, isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const chats = await storage.getChats(userId);
    res.json(chats);
  }));

  app.get(api.chats.get.path, isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = idParamSchema.parse(req.params.id);
    const chat = await storage.getChat(userId, id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  }));

  app.post(api.chats.create.path, isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const input = api.chats.create.input.parse(req.body);
    const chat = await storage.createChat(userId, input);
    res.status(201).json(chat);
  }));

  app.put(api.chats.update.path, isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = idParamSchema.parse(req.params.id);
    const input = api.chats.update.input.parse(req.body);
    const updated = await storage.updateChat(userId, id, input);
    if (!updated) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(updated);
  }));

  app.delete(api.chats.delete.path, isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = idParamSchema.parse(req.params.id);
    const deleted = await storage.deleteChat(userId, id);
    if (!deleted) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(204).send();
  }));

  // Global error middleware for Zod + catch-all
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        message: err.errors[0]?.message ?? "Invalid input",
        field: err.errors[0]?.path?.join('.'),
      });
    }
    console.error(`Request failed ${req.method} ${req.path}: ${describeFailure(err)}`);
    res.status(500).json({ message: "Internal server error" });
  });

  return httpServer;
}
