import { Journal } from './journal.js';
import type { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { activityInput, activitySchema, profileInput, profileSchema, reminderInput, reminderSchema, backupSchema, listInput, type Activity, type Profile, type Reminder } from '../contracts/schemas.js';
import { FitlogError } from '../contracts/errors.js';
import { localToday, shiftDate } from '../domain/dates.js';
import { progress } from '../domain/progress.js';
import { goalProgress, checkedRecordDates } from '../domain/goals.js';
import { z } from 'zod';
import { FitlogRepository } from '../infrastructure/repository.js';

export class FitlogService {
  private repository:FitlogRepository;
  readonly journal:Journal;
  constructor(db: DatabaseSync, private now = () => new Date()) {
    this.repository=new FitlogRepository(db);
    this.journal=new Journal(db,()=>this.today(),this.now);
    this.repository.initialize('profile', { displayName: '나의 Fitlog', handle: 'me', timezone: 'Asia/Seoul', version: 1 });
    this.repository.initialize('reminder', { time: '21:00', timezone: 'Asia/Seoul', days: [0,1,2,3,4,5,6], message: '식단 리뷰 시간이에요. 오늘 먹은 식사와 간식을 알려주면 함께 돌아볼게요.', version: 1 });
  }
  transaction<T>(fn: () => T): T { return this.repository.transaction(fn); }
  private setting(key: string) { return this.repository.setting(key); }
  private saveSetting(key: string, value: unknown) { this.repository.saveSetting(key,value); }
  private bump() { this.repository.bump(); }
  getProfile(): Profile { return profileSchema.parse(this.setting('profile')); }
  getReminder(): Reminder { return reminderSchema.parse(this.setting('reminder')); }
  today() { return localToday(this.getProfile().timezone, this.now()); }
  private all(): Activity[] { return this.repository.all(); }
  get(id: string): Activity { z.uuid().parse(id); const row = this.repository.get(id); if (!row) throw new FitlogError('NOT_FOUND', '기록이 없습니다. 다시 조회하세요.'); return row; }
  updateProfile(raw: unknown, expectedVersion: number) { const input = profileInput.parse(raw); return this.transaction(() => { const old = this.getProfile(); if (old.version !== expectedVersion) throw new FitlogError('CONFLICT', '프로필이 변경됐습니다. 새로고침 후 다시 수정하세요.'); const next = { ...input, version: old.version + 1 }; this.saveSetting('profile', next); this.bump(); return next; }); }
  updateReminder(raw: unknown, expectedVersion: number) { const input = reminderInput.parse(raw); return this.transaction(() => { const old = this.getReminder(); if (old.version !== expectedVersion) throw new FitlogError('CONFLICT', '알림 설정이 변경됐습니다. 새로고침하세요.'); const next = { ...input, days: [...input.days].sort(), version: old.version + 1 }; this.saveSetting('reminder', next); this.bump(); return this.reminderRequest(); }); }
  reminderRequest() {
    const reminder = this.getReminder(); const names = ['일', '월', '화', '수', '목', '금', '토']; const days = reminder.days.length === 7 ? '매일' : reminder.days.map(d => names[d]).join('·') + '요일';
    return { reminder, registrationStatus: 'not_verified' as const, request: `${reminder.timezone} 기준 ${days} ${reminder.time}에 이 채팅으로 다음 고정 알림을 보내는 클라우드 예약을 만들어줘: ${JSON.stringify(reminder.message)}. 로컬 파일이나 건강 기록을 조회하지 마. ChatGPT 모바일 푸시를 사용할 수 있으면 함께 알려줘. 기존 동일 예약이 있으면 중복 생성하지 말고 수정해줘. 실제 저장된 예약의 ID·시간대·주기·전달 위치를 확인해줘. 푸시 수신을 확인하지 않았다면 수신 완료라고 말하지 마.` };
  }
  create(raw: unknown, key: string) {
    const input = activityInput.parse(raw); z.string().min(8).max(128).parse(key);
    const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    return this.transaction(() => {
      const prior = this.repository.idempotency(key);
      if (prior) { if (prior.hash !== hash) throw new FitlogError('CONFLICT', '같은 요청 키에 다른 내용이 있습니다.'); try { return { activity: this.get(String(prior.resultId)), replayed: true }; } catch(e) { if (e instanceof FitlogError && e.code === 'NOT_FOUND') throw new FitlogError('CONFLICT', '이 요청으로 만든 기록은 삭제됐습니다. 새 요청 키를 사용하세요.'); throw e; } }
      const profile = this.getProfile(); if (input.localDate > localToday(profile.timezone, this.now())) throw new FitlogError('VALIDATION_ERROR', '미래의 실제 기록은 저장할 수 없습니다.');
      const timestamp = this.now().toISOString(); const activity: Activity = { ...input, id: randomUUID(), timezone: profile.timezone, version: 1, createdAt: timestamp, updatedAt: timestamp };
      this.repository.insert(activity);
      this.repository.addIdempotency(key, hash, activity.id); this.bump(); return { activity, replayed: false };
    });
  }
  update(id: string, raw: unknown, expectedVersion: number) {
    const input = activityInput.parse(raw);
    return this.transaction(() => { const old = this.get(id); if (old.version !== expectedVersion) throw new FitlogError('CONFLICT', '다른 세션에서 수정됐습니다. 최신 내용을 확인하세요.'); if (input.localDate > this.today()) throw new FitlogError('VALIDATION_ERROR', '미래의 실제 기록은 저장할 수 없습니다.');
      const next: Activity = { ...old, ...input, version: old.version + 1, updatedAt: this.now().toISOString() };
      this.repository.update(next); this.bump(); return next;
    });
  }
  delete(id: string, expectedVersion: number) { z.uuid().parse(id); return this.transaction(() => { const old = this.repository.get(id); if (!old) return { deleted: true, alreadyDeleted: true, id }; if (old.version !== expectedVersion) throw new FitlogError('CONFLICT', '기록이 변경됐습니다. 최신 내용 확인 후 삭제하세요.'); this.repository.delete(id); this.bump(); return { deleted: true, alreadyDeleted: false, id }; }); }
  list(raw: unknown) {
    const query = listInput.parse(raw); let cursor: { date: string; id: string } | undefined;
    if (query.cursor) { try { cursor = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), id: z.uuid() }).strict().parse(JSON.parse(Buffer.from(query.cursor, 'base64url').toString('utf8'))); } catch { throw new FitlogError('VALIDATION_ERROR', '잘못된 페이지 커서입니다.'); } }
    const where = ['1=1']; const params: (string | number)[] = [];
    if(query.from) { where.push('localDate>=?'); params.push(query.from); } if(query.to) { where.push('localDate<=?'); params.push(query.to); }
    if(query.type !== 'all') { where.push('type=?'); params.push(query.type); } if(cursor) { where.push('(localDate<? OR (localDate=? AND id<?))'); params.push(cursor.date,cursor.date,cursor.id); }
    params.push(query.limit + 1); const rows = this.repository.list(where,params);
    const items = rows.slice(0,query.limit); const last = items.at(-1); const nextCursor = rows.length > query.limit && last ? Buffer.from(JSON.stringify({ date:last.localDate, id:last.id })).toString('base64url') : null;
    return { items, nextCursor };
  }
  snapshot(type: 'all' | 'workout' | 'meal' = 'all') {
    // One read transaction gives the UI one consistent revision across concurrent clients.
    return this.repository.transaction(() => { const profile = this.getProfile(); const today = localToday(profile.timezone, this.now()); const records=this.all(); const todays=records.filter(r=>r.localDate===today);
      const goalConfig=this.journal.goalConfig(),checks=this.journal.checks(today);
      const checklist=this.journal.goalsFor(today).map(g=>{const c=checks.find(c=>c.slot===g.id);return {id:g.id,done:todays.some(r=>g.id==='workout'?r.type==='workout':r.type==='meal'&&r.mealType===g.id),label:c?.label||g.label,controlType:c?.controlType??g.controlType,count:c?.count??0,target:c?.target??g.target,status:c?.status??'unwritten',occurrence:c?.occurrence??'unknown',version:c?.version??0,note:c?.note??''};});
      const allChecks=this.journal.allChecks();
      const visibleChecks=type==='all'?allChecks:allChecks.filter(c=>type==='workout'?c.slot==='workout':c.slot!=='workout');
      return { schemaVersion: 1, revision: Number(this.setting('revision')), profile, today, todayChecklist:checklist, goalConfigVersion:goalConfig.version,goalHistory:goalConfig.revisions,goals:goalProgress(allChecks,today,date=>this.journal.goalsFor(date).map(g=>g.id)), progress: progress([...records,...this.journal.photoDays()], today, type,checkedRecordDates(visibleChecks,today)), recent: this.list({ type }), reminder: this.reminderRequest() }; },false);
  }
  review(days: 7 | 30) { const today = this.today(); const from = shiftDate(today, -(days - 1)); const records = this.all().filter(r => r.localDate >= from && r.localDate <= today); const p = progress([...records,...this.journal.photoDays().filter(p=>p.localDate>=from&&p.localDate<=today)], today, 'all', checkedRecordDates(this.journal.allChecks().filter(c=>c.localDate>=from&&c.localDate<=today),today)); return { journals:this.journal.review(from,today), from, to:today, timezone:this.getProfile().timezone, recordedDays:p.recordedDays, missingDays:days-p.recordedDays, workouts:records.filter(r=>r.type==='workout').length, meals:records.filter(r=>r.type==='meal').length, records:records.slice(0,200), truncated:records.length>200, guidance:'이 기간의 실제 기록만 근거로 요약하세요. 사진 분석값은 추정치이며 사용자 체크와 구분하세요. 사진 없는 음식의 칼로리·건강 효과·미확인 목표 달성 여부를 생성하지 마세요.' }; }
  backup() { return this.transaction(() => ({ schemaVersion:1 as const, exportedAt:this.now().toISOString(), profile:this.getProfile(), reminder:this.getReminder(), activities:this.all(), idempotency:this.repository.allIdempotency(), journal:this.journal.backup() })); }
  validateBackup(raw: unknown) { const data = backupSchema.parse(raw); this.journal.validateBackup(data.journal); if(new Set(data.activities.map(a=>a.id)).size!==data.activities.length || new Set(data.idempotency.map(a=>a.key)).size!==data.idempotency.length) throw new FitlogError('VALIDATION_ERROR','백업에 중복 ID 또는 요청 키가 있습니다.'); if(data.activities.some(a=>a.localDate>localToday(a.timezone,this.now()))) throw new FitlogError('VALIDATION_ERROR','백업에 미래 기록이 있습니다.'); return data; }
  restore(raw: unknown, beforeReplace: (snapshot: ReturnType<FitlogService['backup']>) => void) {
    const data = this.validateBackup(raw);
    return this.transaction(() => {
      const old = { schemaVersion:1 as const, exportedAt:this.now().toISOString(), profile:this.getProfile(), reminder:this.getReminder(), activities:this.all(), idempotency:this.repository.allIdempotency(), journal:this.journal.backup() };
      beforeReplace(old); const versions = new Map(old.activities.map(a=>[a.id,a.version]));
      this.repository.clearRecords(); this.journal.restore(data.journal);
      for(const a of data.activities) { const next={...a,version:Math.max(a.version,versions.get(a.id)??0)+1}; this.repository.insert(next); }
      for(const row of data.idempotency) this.repository.addIdempotency(row.key,row.hash,row.resultId);
      this.saveSetting('profile',{...data.profile,version:Math.max(data.profile.version,old.profile.version)+1}); this.saveSetting('reminder',{...data.reminder,version:Math.max(data.reminder.version,old.reminder.version)+1}); this.bump(); return { restored:data.activities.length };
    });
  }
}
