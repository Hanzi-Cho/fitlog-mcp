import { experienceBackup, initialGoalConfig } from './experience.js';
import { z } from 'zod';
import { validDate } from '../domain/dates.js';
export const dateSchema = z.string().refine(validDate, '올바른 YYYY-MM-DD 날짜를 입력하세요.');
export const timezoneSchema = z.string().max(80).refine(t => { try { new Intl.DateTimeFormat('en', { timeZone: t }); return true; } catch { return false; } }, '유효한 시간대가 아닙니다.');
export const typeSchema = z.enum(['workout', 'meal']);
export const filterSchema = z.enum(['all', 'workout', 'meal']);
export const activityInput = z.object({
  type: typeSchema, localDate: dateSchema, title: z.string().trim().min(1).max(200),
  durationMinutes: z.number().finite().positive().max(1440).nullable().default(null),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).nullable().default(null),
  note: z.string().trim().max(2000).nullable().default(null),
}).strict().superRefine((a, ctx) => {
  if (a.type === 'meal' && (!a.mealType || a.durationMinutes !== null)) ctx.addIssue({ code: 'custom', message: '식단에는 끼니가 필요하고 운동 시간은 없어야 합니다.' });
  if (a.type === 'workout' && a.mealType !== null) ctx.addIssue({ code: 'custom', message: '운동에는 끼니를 지정하지 않습니다.' });
});
export const profileInput = z.object({ displayName: z.string().trim().min(1).max(60), handle: z.string().regex(/^[a-zA-Z0-9_-]{1,32}$/), timezone: timezoneSchema }).strict();
export const profileSchema = profileInput.extend({ version: z.number().int().positive() });
export const activitySchema = activityInput.safeExtend({ id: z.uuid(), timezone: timezoneSchema, version: z.number().int().positive(), createdAt: z.iso.datetime(), updatedAt: z.iso.datetime() });
export const reminderInput = z.object({ time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/), timezone: timezoneSchema, days: z.array(z.number().int().min(0).max(6)).min(1).max(7).refine(d => new Set(d).size === d.length), message: z.string().trim().min(1).max(500) }).strict();
export const reminderSchema = reminderInput.extend({ version: z.number().int().positive() });
export type ActivityInput = z.infer<typeof activityInput>;
export type Activity = z.infer<typeof activitySchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export const listInput = z.object({ from: dateSchema.optional(), to: dateSchema.optional(), type: filterSchema.default('all'), limit: z.number().int().min(1).max(200).default(50), cursor: z.string().max(200).optional() }).strict().refine(x => !x.from || !x.to || x.from <= x.to, '날짜 범위를 확인하세요.');
export const backupSchema = z.object({ schemaVersion: z.literal(1), exportedAt: z.iso.datetime(), journal:z.lazy(()=>experienceBackup).default(()=>experienceBackup.parse({})), profile: profileSchema, reminder: reminderSchema, activities: z.array(activitySchema).max(100000), idempotency: z.array(z.object({ key: z.string().min(8).max(128), hash: z.string().regex(/^[a-f0-9]{64}$/), resultId: z.uuid() }).strict()).max(200000) }).strict();
