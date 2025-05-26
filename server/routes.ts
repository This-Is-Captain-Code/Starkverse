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
      const eventId = parseInt(req.params.id); // This is actually the event ID

      // Get user's current points
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get event details
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Get raffle for this event
      const raffle = await storage.getRaffleByEventId(eventId);
      if (!raffle) {
        return res.status(404).json({ message: "Raffle not found" });
      }

      const entryPoints = event.entryPoints;

      if (user.points < entryPoints) {
        return res.status(400).json({ message: "Insufficient points" });
      }

      // Deduct points
      await storage.updateUserPoints(userId, user.points - entryPoints);

      // Add raffle entry
      const entry = await storage.addRaffleEntry({
        raffleId: raffle.id,
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

  // Create raffles for existing events (one-time setup)
  app.post('/api/setup/create-raffles', isAuthenticated, async (req: any, res) => {
    try {
      const events = await storage.getEvents();
      
      for (const event of events) {
        // Check if raffle already exists
        const existingRaffle = await storage.getRaffleByEventId(event.id);
        
        if (!existingRaffle) {
          // Create raffle ending 1 hour before event
          const raffleEndTime = new Date(event.eventDate);
          raffleEndTime.setHours(raffleEndTime.getHours() - 1);
          
          await storage.createRaffle({
            eventId: event.id,
            endTime: raffleEndTime,
          });
        }
      }
      
      res.json({ message: "Raffles created successfully" });
    } catch (error) {
      console.error("Error creating raffles:", error);
      res.status(500).json({ message: "Failed to create raffles" });
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

  // Check if user won a raffle
  app.get('/api/raffle/:eventId/winner', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId);
      
      const raffle = await storage.getRaffleByEventId(eventId);
      if (!raffle) {
        return res.status(404).json({ message: "Raffle not found" });
      }

      const winners = await storage.getRaffleWinners(raffle.id);
      const isWinner = winners.some(winner => winner.userId === userId);
      
      if (isWinner) {
        const event = await storage.getEvent(eventId);
        res.json({ 
          isWinner: true, 
          worldUrl: event?.worldUrl,
          eventTitle: event?.title 
        });
      } else {
        res.json({ isWinner: false });
      }
    } catch (error) {
      console.error("Error checking winner status:", error);
      res.status(500).json({ message: "Failed to check winner status" });
    }
  });

  // Simulate raffle drawing (for demo purposes)
  app.post('/api/raffle/:eventId/draw', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const userId = req.user.claims.sub;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const raffle = await storage.getRaffleByEventId(eventId);
      if (!raffle) {
        return res.status(404).json({ message: "Raffle not found" });
      }

      // Get all entries for this raffle
      const entries = await storage.getRaffleEntries(raffle.id);
      
      if (entries.length === 0) {
        return res.status(400).json({ message: "No entries found" });
      }

      // For demo - randomly select winners
      const maxWinners = Math.min(event.maxWinners, entries.length);
      const winners = [];
      const availableEntries = [...entries];
      
      for (let i = 0; i < maxWinners; i++) {
        const randomIndex = Math.floor(Math.random() * availableEntries.length);
        const winner = availableEntries[randomIndex];
        winners.push(winner);
        availableEntries.splice(randomIndex, 1);
      }

      // Store winners
      for (const winner of winners) {
        await storage.addRaffleWinner(raffle.id, winner.userId);
      }

      // End the raffle
      await storage.endRaffle(raffle.id);

      res.json({ 
        winners: winners.length,
        isWinner: winners.some(w => w.userId === userId)
      });
    } catch (error) {
      console.error("Error drawing raffle:", error);
      res.status(500).json({ message: "Failed to draw raffle" });
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
