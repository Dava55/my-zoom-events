import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),            // Тема
  lecturer: text('lecturer').notNull(),      // Лектор
  eventDate: timestamp('event_date').notNull(), // Час / Дата
  zoomLink: text('zoom_link').notNull(),     // Посилання на Zoom
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const attendees = pgTable('attendees', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  omNumber: text('om_number').notNull(),
  email: text('email').notNull(),
  userName: text('user_name').notNull(),
  userToken: text('user_token').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});