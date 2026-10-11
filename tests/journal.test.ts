import {goalProgress} from '../src/domain/goals.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openDatabase} from '../src/infrastructure/database.js';
import {FitlogService} from '../src/application/service.js';
function setup(t:any){const dir=mkdtempSync(join(tmpdir(),'fitlog-journal-')),db=openDatabase(dir);t.after(()=>db.close());return {db,dir,s:new FitlogService(db,()=>new Date('2026-10-10T05:00:00Z'))};}
const image={localDate:'2026-10-10',mealType:'lunch',mimeType:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT1kAAAAASUVORK5CYII='};
const estimate={foods:[{name:'합성 식단',portion:'1회'}],calories:600,protein:30,carbs:80,fat:15,confidence:'medium',note:'합성 테스트 추정'};
test('goal heatmap counts unique affirmative goals, not records, photos or category filters',t=>{
 const {s}=setup(t);
 s.create({type:'meal',localDate:image.localDate,mealType:'lunch',title:'합성 기록'},'goal-test-record');
 s.journal.addPhoto(image);
 assert.equal(s.snapshot().goals.days.length,0);
 for(const [i,slot] of ['workout','breakfast','lunch','dinner'].entries()){
  s.journal.setCheck({localDate:image.localDate,slot,status:'yes',occurrence:'completed'},0);
  const day=s.snapshot().goals.days[0]!;
  assert.equal(day.completed,i+1);assert.equal(day.total,4);assert.equal(day.level,i+1);
  assert.deepEqual(s.snapshot('meal').goals,s.snapshot('workout').goals);
 }
 s.journal.setCheck({localDate:image.localDate,slot:'lunch',status:'no',occurrence:'completed'},1);
 assert.equal(s.snapshot().goals.days[0]!.level,3);
 for(const slot of ['workout','breakfast','dinner'])s.journal.setCheck({localDate:image.localDate,slot,status:'unwritten',occurrence:'unknown'},1);
 assert.equal(s.snapshot().goals.days[0]!.completed,0);assert.equal(s.snapshot().goals.days[0]!.level,0);
});
test('check-only days contribute to record streaks without inventing activity counts',t=>{
 const {s}=setup(t);
 s.journal.setCheck({localDate:'2026-10-09',slot:'workout',status:'yes',occurrence:'completed'},0);
 s.journal.setCheck({localDate:'2026-10-10',slot:'lunch',status:'no',occurrence:'completed'},0);
 s.journal.setCheck({localDate:'2026-10-08',slot:'dinner',status:'unwritten',occurrence:'planned'},0);
 assert.equal(s.snapshot().progress.currentStreak,2);
 assert.equal(s.snapshot().progress.longestStreak,2);
 assert.equal(s.snapshot().progress.days[0]!.workout,0);
 assert.equal(s.snapshot().progress.recordedDays,2);
 assert.equal(s.snapshot('workout').progress.recordedDays,1);
 assert.equal(s.review(7).recordedDays,2);assert.equal(s.review(7).workouts,0);assert.equal(s.review(7).meals,0);
});
test('record existence never means goal adherence; explicit skipped/no/planned persist independently',t=>{const {s,dir}=setup(t);s.create({type:'meal',localDate:'2026-10-10',mealType:'lunch',title:'합성 뷔페'},'journal-buffet');assert.equal(s.snapshot().todayChecklist.find(c=>c.id==='lunch')!.status,'unwritten');s.journal.setCheck({localDate:'2026-10-10',slot:'lunch',status:'no',occurrence:'completed'},0);s.journal.setCheck({localDate:'2026-10-10',slot:'breakfast',status:'unwritten',occurrence:'skipped'},0);s.journal.setCheck({localDate:'2026-10-10',slot:'dinner',status:'unwritten',occurrence:'planned'},0);assert.equal(s.snapshot().todayChecklist.find(c=>c.id==='lunch')!.status,'no');assert.equal(s.snapshot().progress.recordedDays,1);assert.throws(()=>s.journal.setCheck({localDate:'2026-10-10',slot:'dinner',status:'yes',occurrence:'planned'},1));assert.throws(()=>s.journal.setCheck({localDate:'2026-10-10',slot:'lunch',status:'yes',occurrence:'completed'},0),/변경/);const peer=openDatabase(dir);try{assert.equal(new FitlogService(peer).journal.day('2026-10-10').checks.length,3);}finally{peer.close();}});
test('photo deduplication, validation, analysis conflicts, metadata minimization and delete recalculation',t=>{const {s}=setup(t);const p=s.journal.addPhoto(image);assert.equal(s.journal.addPhoto(image).id,p.id);assert.equal(s.journal.day(image.localDate).photos.length,1);assert.ok(!('data' in s.journal.day(image.localDate).photos[0]!));assert.equal(s.journal.day(image.localDate).evaluation,'incomplete');assert.throws(()=>s.journal.addPhoto({...image,data:Buffer.from('<script/>').toString('base64')}));assert.throws(()=>s.journal.addPhoto({...image,localDate:'2026-10-11'}));assert.throws(()=>s.journal.saveAnalysis(p.id,{...estimate,calories:-10},1,'host'));s.journal.saveAnalysis(p.id,estimate,1,'host');assert.equal(s.journal.day(image.localDate).totals.calories,600);assert.throws(()=>s.journal.saveAnalysis(p.id,estimate,1,'manual'),/변경/);s.journal.deletePhoto(p.id,2);assert.equal(s.journal.day(image.localDate).totals.calories,0);assert.throws(()=>s.journal.photo(p.id),/사진이 없습니다/);});
test('daily assessment waits for all meals and explicit targets; skipped meal is not automatically failure',t=>{const {s}=setup(t);for(const slot of ['breakfast','dinner'])s.journal.setCheck({localDate:image.localDate,slot,status:'unwritten',occurrence:'skipped'},0);s.journal.setCheck({localDate:image.localDate,slot:'lunch',status:'unwritten',occurrence:'completed'},0);const p=s.journal.addPhoto(image);s.journal.saveAnalysis(p.id,estimate,1,'host');assert.equal(s.journal.day(image.localDate).evaluation,'no_target');const {version,...profile}=s.journal.nutrition();s.journal.setNutrition({...profile,calorieMin:500,calorieMax:700,proteinMin:20},version);assert.equal(s.journal.day(image.localDate).evaluation,'within_target');s.journal.saveAnalysis(p.id,{...estimate,calories:800},2,'manual');assert.equal(s.journal.day(image.localDate).evaluation,'outside_target');});
test('backup roundtrip includes photo/analysis/check/targets, old backups compatible, restore rolls back and invalidates versions',t=>{const {s}=setup(t);s.journal.setCheck({localDate:image.localDate,slot:'lunch',status:'no',occurrence:'completed'},0);const p=s.journal.addPhoto(image);s.journal.saveAnalysis(p.id,estimate,1,'host');const backup=s.backup();s.journal.deletePhoto(p.id,2);s.restore(backup,()=>{});assert.equal(s.journal.photo(p.id).analysis!.calories,600);assert.equal(s.journal.checks(image.localDate)[0]!.status,'no');assert.throws(()=>s.journal.setCheck({localDate:image.localDate,slot:'lunch',status:'yes',occurrence:'completed'},1),/변경/);const corrupt=structuredClone(backup);corrupt.journal.photos[0]!.hash='0'.repeat(64);assert.throws(()=>s.restore(corrupt,()=>assert.fail()));assert.equal(s.journal.day(image.localDate).photos.length,1);const {journal,...legacy}=backup;s.validateBackup(legacy);assert.throws(()=>s.restore(backup,()=>{throw Error('disk failure');}));assert.equal(s.journal.day(image.localDate).photos.length,1);});

test('low-confidence/duplicate-meal photos do not produce automatic adherence; reminder versions survive restore',t=>{const {s}=setup(t);for(const slot of ['breakfast','dinner'])s.journal.setCheck({localDate:image.localDate,slot,status:'unwritten',occurrence:'skipped'},0);s.journal.setCheck({localDate:image.localDate,slot:'lunch',status:'unwritten',occurrence:'completed'},0);const p=s.journal.addPhoto(image);s.journal.saveAnalysis(p.id,{...estimate,confidence:'low'},1,'host');assert.equal(s.journal.day(image.localDate).evaluation,'needs_review');const old=s.journal.reminders();s.journal.setReminders({enabled:true,breakfast:'09:00',lunch:'13:00',dinner:'21:00'},old.version);assert.throws(()=>s.journal.setReminders({enabled:true,breakfast:'25:00',lunch:null,dinner:null},2));assert.throws(()=>s.journal.setReminders({enabled:false,breakfast:null,lunch:null,dinner:null},1),/변경/);const backup=s.backup();s.restore(backup,()=>{});assert.equal(s.journal.reminders().breakfast,'09:00');assert.ok(s.journal.reminders().version>2);assert.equal(s.review(7).journals[0]!.photos.length,1);});

test('goal intensity handles variable N, duplicates, planned and future checks',()=>{
 const base={localDate:'2026-10-10',slot:'a',status:'yes',occurrence:'completed'};
 assert.equal(goalProgress([base,base],base.localDate,['a','b']).days[0]!.completed,1);
 assert.equal(goalProgress([base],base.localDate,['a','b']).days[0]!.level,2);
 assert.equal(goalProgress([base],base.localDate,['a']).days[0]!.level,4);
 assert.equal(goalProgress([{...base,occurrence:'planned'}],base.localDate,['a']).days[0]!.level,0);
 assert.equal(goalProgress([{...base,localDate:'2026-10-11'}],base.localDate,['a']).days.length,0);
 assert.equal(goalProgress([base],base.localDate,[]).days[0]!.ratio,0);
});
