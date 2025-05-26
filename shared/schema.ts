import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  points: integer("points").default(1000).notNull(), // Default 1000 SP for new users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // 'viveverse' | 'meta-horizon'
  worldUrl: varchar("world_url").notNull(),
  entryPoints: integer("entry_points").notNull(),
  maxWinners: integer("max_winners").notNull(),
  eventDate: timestamp("event_date").notNull(),
  status: varchar("status").notNull().default("upcoming"), // 'upcoming' | 'live' | 'ended'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Raffles table
export const raffles = pgTable("raffles", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  status: varchar("status").notNull().default("active"), // 'active' | 'ended'
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Raffle entries table
export const raffleEntries = pgTable("raffle_entries", {
  id: serial("id").primaryKey(),
  raffleId: integer("raffle_id").notNull().references(() => raffles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  entryCount: integer("entry_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Raffle winners table
export const raffleWinners = pgTable("raffle_winners", {
  id: serial("id").primaryKey(),
  raffleId: integer("raffle_id").notNull().references(() => raffles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  raffleEntries: many(raffleEntries),
  raffleWinners: many(raffleWinners),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  raffles: many(raffles),
}));

export const rafflesRelations = relations(raffles, ({ one, many }) => ({
  event: one(events, {
    fields: [raffles.eventId],
    references: [events.id],
  }),
  entries: many(raffleEntries),
  winners: many(raffleWinners),
}));

export const raffleEntriesRelations = relations(raffleEntries, ({ one }) => ({
  raffle: one(raffles, {
    fields: [raffleEntries.raffleId],
    references: [raffles.id],
  }),
  user: one(users, {
    fields: [raffleEntries.userId],
    references: [users.id],
  }),
}));

export const raffleWinnersRelations = relations(raffleWinners, ({ one }) => ({
  raffle: one(raffles, {
    fields: [raffleWinners.raffleId],
    references: [raffles.id],
  }),
  user: one(users, {
    fields: [raffleWinners.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRaffleSchema = createInsertSchema(raffles).omit({
  id: true,
  createdAt: true,
});

export const insertRaffleEntrySchema = createInsertSchema(raffleEntries).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertRaffle = z.infer<typeof insertRaffleSchema>;
export type Raffle = typeof raffles.$inferSelect;
export type InsertRaffleEntry = z.infer<typeof insertRaffleEntrySchema>;
export type RaffleEntry = typeof raffleEntries.$inferSelect;
export type RaffleWinner = typeof raffleWinners.$inferSelect;
