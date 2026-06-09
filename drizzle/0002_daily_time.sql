-- Drop the old column and add new ones
ALTER TABLE "scheduled_activities" DROP COLUMN IF EXISTS "scheduled_at";
ALTER TABLE "scheduled_activities" ADD COLUMN IF NOT EXISTS "daily_time" text NOT NULL DEFAULT '12:00';
ALTER TABLE "scheduled_activities" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true;
ALTER TABLE "scheduled_activities" ADD COLUMN IF NOT EXISTS "last_notified_date" text;
