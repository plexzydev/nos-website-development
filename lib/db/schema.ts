import { pgTable, text, timestamp, boolean, decimal, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Users ───────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Discord ID
  nickname: text('nickname'),
  userHash: text('user_hash'),
  avatarUrl: text('avatar_url'),
  isMechanic: boolean('is_mechanic').default(false),
  isAdmin: boolean('is_admin').default(false),
  isRemoved: boolean('is_removed').default(false),
  discordNotifs: boolean('discord_notifs').default(true), // Can toggle off Discord DMs
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Activities (mechanic work logs) ─────────────────────────────────
export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  mechanicId: text('mechanic_id').references(() => users.id),
  type: text('type'), // 'repair', 'tuning', 'maintenance', 'other'
  matricula: text('matricula'), // Vehicle license plate
  scheduledActivityId: text('scheduled_activity_id'), // Relates to scheduledActivities.id
  gruaMatricula: text('grua_matricula'), // Crane license plate (optional)
  gasoline: integer('gasoline'),
  boxes: integer('boxes'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Activity Mentions ───────────────────────────────────────────────
export const activityMentions = pgTable('activity_mentions', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').references(() => activities.id),
  mentionedUserId: text('mentioned_user_id').references(() => users.id),
});

// ─── Scheduled Activities (admin creates these with a timer) ─────────
export const scheduledActivities = pgTable('scheduled_activities', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  dailyTime: text('daily_time').notNull(), // e.g. '14:00' — repeats every day
  isActive: boolean('is_active').default(true),
  lastNotifiedDate: text('last_notified_date'), // e.g. '2026-06-09' to track daily notif
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Warnings ────────────────────────────────────────────────────────
export const warnings = pgTable('warnings', {
  id: text('id').primaryKey(),
  mechanicId: text('mechanic_id').references(() => users.id),
  adminId: text('admin_id').references(() => users.id),
  reason: text('reason').notNull(),
  severity: text('severity').default('amarilla'), // blanca, amarilla, roja, negra
  fineAmount: text('fine_amount'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Notifications ───────────────────────────────────────────────────
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Tow Trucks ──────────────────────────────────────────────────────
export const towTrucks = pgTable('tow_trucks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // Ej: "Grua 01"
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Settings ────────────────────────────────────────────────────────
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'),
});

// ─── Forum ───────────────────────────────────────────────────────────
export const forumThreads = pgTable('forum_threads', {
  id: text('id').primaryKey(),
  authorId: text('author_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const forumComments = pgTable('forum_comments', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }).notNull(),
  authorId: text('author_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  mediaUrl: text('media_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const forumVotes = pgTable('forum_votes', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }).notNull(),
  voterId: text('voter_id').notNull(), // UUID stored in cookie
  vote: integer('vote').notNull(), // 1 for up, -1 for down
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ═══ Relations ═══════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  mentions: many(activityMentions),
  warnings: many(warnings, { relationName: 'mechanicWarnings' }),
  givenWarnings: many(warnings, { relationName: 'adminWarnings' }),
  scheduledActivities: many(scheduledActivities),
  notifications: many(notifications),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  mechanic: one(users, {
    fields: [activities.mechanicId],
    references: [users.id],
  }),
  scheduledActivity: one(scheduledActivities, {
    fields: [activities.scheduledActivityId],
    references: [scheduledActivities.id],
  }),
  mentions: many(activityMentions),
}));

export const activityMentionsRelations = relations(activityMentions, ({ one }) => ({
  activity: one(activities, {
    fields: [activityMentions.activityId],
    references: [activities.id],
  }),
  mentionedUser: one(users, {
    fields: [activityMentions.mentionedUserId],
    references: [users.id],
  }),
}));

export const scheduledActivitiesRelations = relations(scheduledActivities, ({ one }) => ({
  admin: one(users, {
    fields: [scheduledActivities.adminId],
    references: [users.id],
  }),
}));

export const warningsRelations = relations(warnings, ({ one }) => ({
  mechanic: one(users, {
    fields: [warnings.mechanicId],
    references: [users.id],
    relationName: 'mechanicWarnings',
  }),
  admin: one(users, {
    fields: [warnings.adminId],
    references: [users.id],
    relationName: 'adminWarnings',
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const forumThreadsRelations = relations(forumThreads, ({ one, many }) => ({
  author: one(users, {
    fields: [forumThreads.authorId],
    references: [users.id],
  }),
  comments: many(forumComments),
  votes: many(forumVotes),
}));

export const forumCommentsRelations = relations(forumComments, ({ one }) => ({
  thread: one(forumThreads, {
    fields: [forumComments.threadId],
    references: [forumThreads.id],
  }),
  author: one(users, {
    fields: [forumComments.authorId],
    references: [users.id],
  }),
}));

export const forumVotesRelations = relations(forumVotes, ({ one }) => ({
  thread: one(forumThreads, {
    fields: [forumVotes.threadId],
    references: [forumThreads.id],
  }),
}));
