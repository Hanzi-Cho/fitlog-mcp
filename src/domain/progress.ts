import type { Activity } from '../contracts/schemas.js';
import { shiftDate } from './dates.js';
export function progress(records: Pick<Activity,'localDate'|'type'>[], today: string, type: 'all' | 'workout' | 'meal' = 'all') {
  const filtered = records.filter(r => r.localDate <= today && (type === 'all' || r.type === type));
  const byDay = new Map<string, { date: string; workout: number; meal: number }>();
  for (const record of filtered) { const day = byDay.get(record.localDate) ?? { date: record.localDate, workout: 0, meal: 0 }; day[record.type]++; byDay.set(record.localDate, day); }
  const days = [...byDay.keys()].sort(); let longestStreak = 0, streak = 0, previous: string | undefined;
  for (const day of days) { streak = previous && shiftDate(previous, 1) === day ? streak + 1 : 1; longestStreak = Math.max(longestStreak, streak); previous = day; }
  let currentStreak = 0, cursor = byDay.has(today) ? today : shiftDate(today, -1);
  while (byDay.has(cursor)) { currentStreak++; cursor = shiftDate(cursor, -1); }
  return { recordedDays: days.length, currentStreak, longestStreak, days: [...byDay.values()].sort((a,b) => a.date.localeCompare(b.date)) };
}
