import {
  users,
  events,
  raffles,
  raffleEntries,
  raffleWinners,
  eventCompletions,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type Raffle,
  type InsertRaffle,
  type RaffleEntry,
  type InsertRaffleEntry,
  type RaffleWinner,
  type EventCompletion,
  type InsertEventCompletion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, lt } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPoints(userId: string, points: number): Promise<User>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByCreator(creatorId: string): Promise<Event[]>;
  
  // Raffle operations
  createRaffle(raffle: InsertRaffle): Promise<Raffle>;
  getActiveRaffles(): Promise<Raffle[]>;
  getRaffleByEventId(eventId: number): Promise<Raffle | undefined>;
  endRaffle(raffleId: number): Promise<void>;
  
  // Raffle entry operations
  addRaffleEntry(entry: InsertRaffleEntry): Promise<RaffleEntry>;
  getUserRaffleEntries(userId: string, raffleId: number): Promise<RaffleEntry[]>;
  getRaffleEntries(raffleId: number): Promise<RaffleEntry[]>;
  
  // Raffle winner operations
  addRaffleWinner(raffleId: number, userId: string): Promise<RaffleWinner>;
  getRaffleWinners(raffleId: number): Promise<RaffleWinner[]>;
  
  // Event completion operations
  addEventCompletion(completion: InsertEventCompletion): Promise<EventCompletion>;
  getUserCompletions(userId: string): Promise<EventCompletion[]>;
  getUnclaimedRewards(userId: string): Promise<EventCompletion[]>;
  claimReward(completionId: number): Promise<User>;
  
  // Reset operations
  clearRaffleData(): Promise<void>;
  
  // Statistics
  getStats(): Promise<{
    totalEvents: number;
    activeUsers: number;
    pointsDistributed: number;
    raffleWinners: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPoints(userId: string, points: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ points, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByCreator(creatorId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.creatorId, creatorId))
      .orderBy(desc(events.createdAt));
  }

  // Raffle operations
  async createRaffle(raffle: InsertRaffle): Promise<Raffle> {
    const [newRaffle] = await db.insert(raffles).values(raffle).returning();
    return newRaffle;
  }

  async getActiveRaffles(): Promise<Raffle[]> {
    return await db
      .select()
      .from(raffles)
      .where(and(eq(raffles.status, "active"), lt(raffles.endTime, new Date())))
      .orderBy(desc(raffles.createdAt));
  }

  async getRaffleByEventId(eventId: number): Promise<Raffle | undefined> {
    const [raffle] = await db
      .select()
      .from(raffles)
      .where(eq(raffles.eventId, eventId));
    return raffle;
  }

  async endRaffle(raffleId: number): Promise<void> {
    await db
      .update(raffles)
      .set({ status: "ended" })
      .where(eq(raffles.id, raffleId));
  }

  // Raffle entry operations
  async addRaffleEntry(entry: InsertRaffleEntry): Promise<RaffleEntry> {
    // Check if user already has entries for this raffle
    const existingEntry = await db
      .select()
      .from(raffleEntries)
      .where(
        and(
          eq(raffleEntries.raffleId, entry.raffleId),
          eq(raffleEntries.userId, entry.userId)
        )
      );

    if (existingEntry.length > 0) {
      // Update existing entry
      const [updatedEntry] = await db
        .update(raffleEntries)
        .set({ entryCount: existingEntry[0].entryCount + 1 })
        .where(eq(raffleEntries.id, existingEntry[0].id))
        .returning();
      return updatedEntry;
    } else {
      // Create new entry with default entryCount
      const [newEntry] = await db
        .insert(raffleEntries)
        .values({
          ...entry,
          entryCount: 1
        })
        .returning();
      return newEntry;
    }
  }

  async getUserRaffleEntries(userId: string, raffleId: number): Promise<RaffleEntry[]> {
    return await db
      .select()
      .from(raffleEntries)
      .where(
        and(
          eq(raffleEntries.userId, userId),
          eq(raffleEntries.raffleId, raffleId)
        )
      );
  }

  async getRaffleEntries(raffleId: number): Promise<RaffleEntry[]> {
    return await db
      .select()
      .from(raffleEntries)
      .where(eq(raffleEntries.raffleId, raffleId));
  }

  // Raffle winner operations
  async addRaffleWinner(raffleId: number, userId: string): Promise<RaffleWinner> {
    const [winner] = await db
      .insert(raffleWinners)
      .values({ raffleId, userId })
      .returning();
    return winner;
  }

  async getRaffleWinners(raffleId: number): Promise<RaffleWinner[]> {
    return await db
      .select()
      .from(raffleWinners)
      .where(eq(raffleWinners.raffleId, raffleId));
  }

  // Statistics
  async getStats(): Promise<{
    totalEvents: number;
    activeUsers: number;
    pointsDistributed: number;
    raffleWinners: number;
  }> {
    const [eventsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(events);

    const [usersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [pointsSum] = await db
      .select({ sum: sql<number>`sum(${users.points})` })
      .from(users);

    const [winnersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(raffleWinners);

    return {
      totalEvents: eventsCount.count,
      activeUsers: usersCount.count,
      pointsDistributed: pointsSum.sum || 0,
      raffleWinners: winnersCount.count,
    };
  }

  // Event completion operations
  async addEventCompletion(completion: InsertEventCompletion): Promise<EventCompletion> {
    const [eventCompletion] = await db
      .insert(eventCompletions)
      .values(completion)
      .returning();
    return eventCompletion;
  }

  async getUserCompletions(userId: string): Promise<EventCompletion[]> {
    return await db
      .select()
      .from(eventCompletions)
      .where(eq(eventCompletions.userId, userId))
      .orderBy(desc(eventCompletions.completedAt));
  }

  async getUnclaimedRewards(userId: string): Promise<EventCompletion[]> {
    return await db
      .select()
      .from(eventCompletions)
      .where(
        and(
          eq(eventCompletions.userId, userId),
          eq(eventCompletions.rewardClaimed, false)
        )
      )
      .orderBy(desc(eventCompletions.completedAt));
  }

  async claimReward(completionId: number): Promise<User> {
    // Get the completion first
    const [completion] = await db
      .select()
      .from(eventCompletions)
      .where(eq(eventCompletions.id, completionId));

    if (!completion || completion.rewardClaimed) {
      throw new Error("Reward already claimed or completion not found");
    }

    // Mark reward as claimed
    await db
      .update(eventCompletions)
      .set({ rewardClaimed: true })
      .where(eq(eventCompletions.id, completionId));

    // Award the SP points to the user
    return await this.updateUserPoints(completion.userId, completion.spAwarded);
  }

  // Reset operations
  async clearRaffleData(): Promise<void> {
    // Clear all raffle winners first (due to foreign key constraints)
    await db.delete(raffleWinners);
    
    // Clear all raffle entries
    await db.delete(raffleEntries);
  }
}

export const storage = new DatabaseStorage();
