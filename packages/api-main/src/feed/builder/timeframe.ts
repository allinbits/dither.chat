import { gte, sql } from 'drizzle-orm';

import { FeedTable } from '../../../drizzle/schema';

const ONE_YEAR_HOURS = 8760;
/**
 * Format: {number}{unit} where unit is h (hours), d (days), or m (minutes)
 * Examples: "24h", "7d", "30m"
 */
export function buildTimeframe(timeframe: string) {
  const match = timeframe.match(/^(\d+)([hdm])$/);
  if (!match) return undefined;

  const [, amountStr, unit] = match;
  const amount = Number.parseInt(amountStr, 10);

  if (Number.isNaN(amount) || amount <= 0 || amount > ONE_YEAR_HOURS) {
    return undefined;
  }

  switch (unit) {
    case 'h':
      return gte(FeedTable.timestamp, sql`NOW() - make_interval(hours => ${amount})`);
    case 'd':
      return gte(FeedTable.timestamp, sql`NOW() - make_interval(days => ${amount})`);
    case 'm':
      return gte(FeedTable.timestamp, sql`NOW() - make_interval(mins => ${amount})`);
    default:
      return undefined;
  }
}
