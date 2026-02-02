import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Protected Routes
  app.get(api.chats.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub; // Get authenticated user ID
      const chats = await storage.getChats(userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.get(api.chats.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const chat = await storage.getChat(Number(req.params.id));
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      // Ensure user owns the chat
      if (chat.userId !== req.user.claims.sub) {
         return res.status(403).json({ message: 'Unauthorized access to this chat' });
      }
      res.json(chat);
    } catch (error) {
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
      const id = Number(req.params.id);
      const existingChat = await storage.getChat(id);
      
      if (!existingChat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      if (existingChat.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const input = api.chats.update.input.parse(req.body);
      const updated = await storage.updateChat(id, input);
      res.json(updated);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update chat" });
    }
  });

  app.delete(api.chats.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const existingChat = await storage.getChat(id);
      
      if (!existingChat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      if (existingChat.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await storage.deleteChat(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chat" });
    }
  });

  return httpServer;
}
