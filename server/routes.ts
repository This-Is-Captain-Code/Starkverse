import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertRaffleEntrySchema, raffles, events, raffleEntries } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Events routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse({
        ...req.body,
        creatorId: userId,
      });

      const event = await storage.createEvent(eventData);
      
      // Create associated raffle
      const raffleEndTime = new Date(eventData.eventDate);
      raffleEndTime.setHours(raffleEndTime.getHours() - 1); // End raffle 1 hour before event
      
      await storage.createRaffle({
        eventId: event.id,
        endTime: raffleEndTime,
      });

      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid event data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create event" });
      }
    }
  });

  // Raffles routes
  app.get('/api/raffles/active', async (req, res) => {
    try {
      const raffles = await storage.getActiveRaffles();
      res.json(raffles);
    } catch (error) {
      console.error("Error fetching active raffles:", error);
      res.status(500).json({ message: "Failed to fetch active raffles" });
    }
  });

  app.post('/api/raffles/:id/enter', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const raffleId = parseInt(req.params.id);

      // Get user's current points
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get raffle and event details
      const raffle = await db
        .select({
          raffle: raffles,
          event: events,
        })
        .from(raffles)
        .innerJoin(events, eq(raffles.eventId, events.id))
        .where(eq(raffles.id, raffleId));

      if (!raffle.length) {
        return res.status(404).json({ message: "Raffle not found" });
      }

      const { event } = raffle[0];
      const entryPoints = event.entryPoints;

      if (user.points < entryPoints) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Deduct points
      await storage.updateUserPoints(userId, user.points - entryPoints);

      // Add raffle entry
      const entry = await storage.addRaffleEntry({
        raffleId,
        userId,
      });

      res.json({ 
        entry, 
        remainingPoints: user.points - entryPoints 
      });
    } catch (error) {
      console.error("Error entering raffle:", error);
      res.status(500).json({ message: "Failed to enter raffle" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/my-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getEventsByCreator(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch your events" });
    }
  });

  app.get('/api/dashboard/my-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get all raffle entries for the user with event details
      const entries = await db
        .select({
          entry: raffleEntries,
          raffle: raffles,
          event: events,
        })
        .from(raffleEntries)
        .innerJoin(raffles, eq(raffleEntries.raffleId, raffles.id))
        .innerJoin(events, eq(raffles.eventId, events.id))
        .where(eq(raffleEntries.userId, userId))
        .orderBy(desc(raffleEntries.createdAt));

      res.json(entries);
    } catch (error) {
      console.error("Error fetching user raffle entries:", error);
      res.status(500).json({ message: "Failed to fetch your raffle entries" });
    }
  });

  // Statistics route
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Points award route (for development/testing)
  app.post('/api/points/award', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUserPoints(userId, user.points + amount);
      res.json({ points: updatedUser.points });
    } catch (error) {
      console.error("Error awarding points:", error);
      res.status(500).json({ message: "Failed to award points" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
