import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const PERIOD_DAYS = 14;

export interface RankingPeriod {
  start: Date;
  end: Date;
}

/**
 * Returns the current 14-day ranking period.
 * If no period exists yet, or if the current one has expired,
 * it creates / rolls over to a new period automatically.
 */
export async function getCurrentRankingPeriod(): Promise<RankingPeriod> {
  const allSettings = await db.select().from(settings);
  const startStr = allSettings.find(s => s.key === 'ranking_period_start')?.value;
  const endStr = allSettings.find(s => s.key === 'ranking_period_end')?.value;

  const now = new Date();

  if (startStr && endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);

    // Period is still active
    if (now < end) {
      return { start, end };
    }

    // Period expired — roll forward until we land on a period that covers "now"
    let newStart = new Date(end);
    let newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + PERIOD_DAYS);

    while (now >= newEnd) {
      newStart = new Date(newEnd);
      newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + PERIOD_DAYS);
    }

    await upsertSetting('ranking_period_start', newStart.toISOString());
    await upsertSetting('ranking_period_end', newEnd.toISOString());
    return { start: newStart, end: newEnd };
  }

  // First time — seed the period.
  // We anchor it so the current period ends in ~14 days from now.
  const start = new Date(now);
  start.setHours(0, 0, 0, 0); // midnight today
  const end = new Date(start);
  end.setDate(end.getDate() + PERIOD_DAYS);

  await upsertSetting('ranking_period_start', start.toISOString());
  await upsertSetting('ranking_period_end', end.toISOString());

  return { start, end };
}

async function upsertSetting(key: string, value: string) {
  const existing = await db.select().from(settings).where(eq(settings.key, key));
  if (existing.length > 0) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}
