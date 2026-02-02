import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";

// Zod schema for validating route params
const idParamSchema = z.coerce.number().int().positive();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Protected Routes - All queries are user-scoped at the DB level
  app.get(api.chats.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getChats(userId);
      res.json(chats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.get(api.chats.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = idParamSchema.parse(req.params.id);
      
      // User-scoped query - returns undefined if not found OR not owned
      const chat = await storage.getChat(userId, id);
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      res.json(chat);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid chat ID' });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to fetch chat" });
    }
  });

  app.post(api.chats.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.chats.create.input.parse(req.body);
      
      const chat = await storage.createChat(userId, input);
      res.status(201).json(chat);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to create chat" });
    }
  });

  app.put(api.chats.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = idParamSchema.parse(req.params.id);
      const input = api.chats.update.input.parse(req.body);
      
      // User-scoped update - returns undefined if not found OR not owned
      const updated = await storage.updateChat(userId, id, input);
      if (!updated) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to update chat" });
    }
  });

  app.delete(api.chats.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = idParamSchema.parse(req.params.id);
      
      // User-scoped delete - returns false if not found OR not owned
      const deleted = await storage.deleteChat(userId, id);
      if (!deleted) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      res.status(204).send();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid chat ID' });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to delete chat" });
    }
  });

  return httpServer;
}
