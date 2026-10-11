import {nutritionEstimate} from '../src/domain/nutrition.js';
import {dueOccurrence} from '../src/domain/alarms.js';
import {alarmSchema} from '../src/contracts/experience.js';
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

test('count control derives attainment at target, supports reversal/conflicts and backup persistence',t=>{
 const {s}=setup(t);const check={localDate:image.localDate,slot:'workout',label:'스쿼트',controlType:'count',count:50,target:100,status:'yes',occurrence:'completed'};
 const first=s.journal.setCheck(check,0);assert.equal(first.status,'no');assert.equal(s.snapshot().goals.days[0]!.completed,0);assert.equal(s.snapshot().todayChecklist[0]!.count,50);
 assert.throws(()=>s.journal.setCheck({...check,count:100},0),/변경/);
 const done=s.journal.setCheck({...check,count:100,status:'no'},1);assert.equal(done.status,'yes');assert.equal(s.snapshot().goals.days[0]!.completed,1);
 s.journal.setCheck({...check,count:99},2);assert.equal(s.snapshot().goals.days[0]!.completed,0);
 const backup=s.backup();s.restore(backup,()=>{});const restored=s.journal.checks(image.localDate)[0]!;assert.equal(restored.count,99);assert.equal(restored.target,100);assert.equal(restored.label,'스쿼트');assert.equal(restored.controlType,'count');
 for(const patch of [{count:-1},{count:0.5},{target:0},{controlType:'dropdown'}])assert.throws(()=>s.journal.setCheck({...check,...patch},restored.version));
});

test('photo title and feedback enum survive backup, legacy defaults remain compatible',t=>{
 const {s}=setup(t);const p=s.journal.addPhoto({...image,title:'오늘의 점심식사'});
 s.journal.saveAnalysis(p.id,{...estimate,feedback:[{code:'protein_low'},{code:'meal_suggestion',text:'저녁은 고등어를 추천해요'}]},1,'host');
 const backup=s.backup();s.restore(backup,()=>{});const saved=s.journal.photo(p.id);assert.equal(saved.title,'오늘의 점심식사');assert.equal(saved.analysis!.feedback[1]!.text,'저녁은 고등어를 추천해요');
 assert.throws(()=>s.journal.saveAnalysis(p.id,{...estimate,feedback:[{code:'unsupported'}]},saved.version,'host'));
 const legacy=JSON.parse(JSON.stringify(backup));delete legacy.journal.photos[0].title;delete legacy.journal.photos[0].analysis.feedback;
 s.restore(legacy,()=>{});assert.equal(s.journal.photo(p.id).title,'');assert.deepEqual(s.journal.photo(p.id).analysis!.feedback,[]);
});

test('task changes preserve historical goal sets, checks, denominators and backup/restart versions',t=>{
 const {s,db,dir}=setup(t);s.journal.setCheck({localDate:'2026-10-09',slot:'lunch',status:'yes',occurrence:'completed'},0);
 const cfg=s.journal.addGoal({label:'독서',controlType:'count',target:20},1),goal=cfg.revisions.at(-1)!.goals.at(-1)!;
 assert.equal(s.snapshot().todayChecklist.length,5);assert.equal(s.journal.day('2026-10-09').goals.length,4);assert.equal(s.snapshot().goals.days[0]!.total,4);
 assert.throws(()=>s.journal.removeGoal('lunch',1),/변경/);
 s.journal.setCheck({localDate:'2026-10-10',slot:goal.id,controlType:'count',count:20,target:20,status:'no',occurrence:'completed'},0);assert.equal(s.snapshot().goals.days.find(d=>d.date==='2026-10-10')!.completed,1);
 const tomorrow=new FitlogService(db,()=>new Date('2026-10-11T05:00:00Z'));tomorrow.journal.removeGoal(goal.id,2);assert.equal(tomorrow.snapshot().todayChecklist.length,4);assert.equal(tomorrow.journal.day('2026-10-10').goals.length,5);assert.equal(tomorrow.journal.day('2026-10-10').checks.find(c=>c.slot===goal.id)!.count,20);assert.equal(tomorrow.snapshot().goals.days.find(d=>d.date==='2026-10-10')!.total,5);
 const backup=tomorrow.backup();tomorrow.restore(backup,()=>{});assert.equal(tomorrow.journal.day('2026-10-10').goals.length,5);assert.ok(tomorrow.journal.goalConfig().version>3);
 const peer=openDatabase(dir);try{assert.equal(new FitlogService(peer).journal.goalsFor('2026-10-10').length,5);}finally{peer.close();}
 const legacy=structuredClone(backup) as any;delete legacy.journal.goalConfig;assert.equal(tomorrow.validateBackup(legacy).journal.goalConfig.revisions[0]!.goals.length,4);
});

test('task removal retains checks while zero tasks produce a zero denominator',t=>{
 const {s}=setup(t);s.journal.setCheck({localDate:'2026-10-10',slot:'lunch',status:'yes',occurrence:'completed'},0);
 let version=1;for(const id of ['workout','breakfast','lunch','dinner'])s.journal.removeGoal(id,version++);
 assert.equal(s.snapshot().todayChecklist.length,0);assert.equal(s.snapshot().goals.total,0);assert.equal(s.snapshot().goals.days[0]!.completed,0);assert.equal(s.snapshot().goals.days[0]!.level,0);assert.equal(s.journal.day('2026-10-10').checks.length,1);assert.throws(()=>s.journal.setCheck({localDate:'2026-10-10',slot:'lunch',status:'yes',occurrence:'completed'},1),/작업 목록/);
 assert.throws(()=>s.journal.addGoal({label:'   '},version));assert.throws(()=>s.journal.addGoal({label:'합성',controlType:'count',target:0},version));
});

test('editing today goals preserves history/progress and rejects stale checklist writes',t=>{
 const {s}=setup(t),j=s.journal;
 j.setCheck({localDate:'2026-10-09',slot:'workout',label:'옛 운동',status:'yes',occurrence:'completed'},0);
 j.setCheck({localDate:'2026-10-10',slot:'workout',controlType:'count',label:'스쿼트',count:50,target:100,status:'no',occurrence:'completed'},0);
 j.editGoal('workout',{label:'스쿼트 수정',controlType:'count',target:40},1);
 assert.equal(j.day('2026-10-09').goals[0]!.label,'운동');assert.equal(j.checks('2026-10-09')[0]!.label,'옛 운동');
 const check=j.checks('2026-10-10')[0]!;assert.equal(check.count,50);assert.equal(check.status,'yes');assert.equal(check.version,2);assert.equal(s.snapshot().todayChecklist[0]!.label,'스쿼트 수정');
 const {version,...staleCheck}=check;assert.throws(()=>j.setCheck(staleCheck,1),/변경/);assert.throws(()=>j.editGoal('workout',{label:'오래된 요청'},1),/변경/);
 j.editGoal('workout',{label:'운동',controlType:'binary'},2);assert.equal(j.checks('2026-10-10')[0]!.status,'no');assert.equal(j.checks('2026-10-10')[0]!.count,0);
 const backup=s.backup();s.restore(backup,()=>{});assert.equal(s.snapshot().todayChecklist[0]!.label,'운동');
});
test('personal information calculates reference targets without inventing a deficit',t=>{
 const {s}=setup(t),j=s.journal;
 const p=j.setPersonalInfo({goalText:'감량하고 꾸준히 운동',sex:'male',age:30,heightCm:180,weightKg:80},1);
 assert.equal(p.calorieMax,2490);assert.equal(p.proteinMin,64);assert.equal(p.carbMax,404);assert.equal(p.fatMax,96);assert.equal(p.calorieMin,null);assert.equal(p.autoTargets,true);
 assert.equal(j.setPersonalInfo({goalText:'유지',sex:null,age:30,heightCm:180,weightKg:80},p.version).calorieMax,null);
 assert.throws(()=>j.setPersonalInfo({goalText:'',sex:'male',age:17,heightCm:180,weightKg:80},3));assert.throws(()=>j.setPersonalInfo({goalText:'',sex:'male',age:30.5,heightCm:180,weightKg:80},3));
 assert.equal(j.day('2026-10-10').nutrition.goalText,'유지');const backup=s.backup();s.restore(backup,()=>{});assert.equal(j.nutrition().autoTargets,true);
});

test('recurring and one-time alarms use timezone/DST and durable at-most-once claims',t=>{
 const {s,db}=setup(t),j=s.journal;
 const alarm=alarmSchema.parse({id:'test-alarm',name:'테스트',enabled:true,kind:'weekdays',days:[6],startDate:'2026-10-10',time:'13:00',every:2,unit:'hours'});
 j.setReminders({enabled:false,breakfast:null,lunch:null,dinner:null,alarms:[alarm]},1);
 assert.equal(j.claimDueAlarms('Asia/Seoul').length,1);assert.equal(j.claimDueAlarms('Asia/Seoul').length,0);
 const restarted=new FitlogService(db,()=>new Date('2026-10-10T05:00Z'));assert.equal(restarted.journal.claimDueAlarms('Asia/Seoul').length,0);
 const backup=s.backup();s.restore(backup,()=>{});assert.equal(j.claimDueAlarms('Asia/Seoul').length,0);
 assert.equal(dueOccurrence({...alarm,kind:'once'},new Date('2026-10-09T05:00Z'),'Asia/Seoul'),null);
 assert.ok(dueOccurrence({...alarm,kind:'once'},new Date('2026-10-11T05:00Z'),'Asia/Seoul'));
 assert.equal(dueOccurrence({...alarm,days:[1]},new Date('2026-10-10T05:00Z'),'Asia/Seoul'),null);
 const interval={...alarm,kind:'interval' as const};assert.equal(dueOccurrence(interval,new Date('2026-10-10T05:00Z'),'Asia/Seoul'),dueOccurrence(interval,new Date('2026-10-10T05:59Z'),'Asia/Seoul'));assert.notEqual(dueOccurrence(interval,new Date('2026-10-10T06:00Z'),'Asia/Seoul'),dueOccurrence(interval,new Date('2026-10-10T05:00Z'),'Asia/Seoul'));
 assert.equal(dueOccurrence({...interval,unit:'days',every:2},new Date('2026-10-11T05:00Z'),'Asia/Seoul'),null);assert.ok(dueOccurrence({...interval,unit:'days',every:2},new Date('2026-10-12T05:00Z'),'Asia/Seoul'));
 assert.equal(dueOccurrence({...alarm,kind:'once',startDate:'2026-03-08',time:'02:30'},new Date('2026-03-08T09:00Z'),'America/New_York'),null);
 const fall={...alarm,days:[0],time:'01:30'};assert.equal(dueOccurrence(fall,new Date('2026-11-01T05:45Z'),'America/New_York'),dueOccurrence(fall,new Date('2026-11-01T06:45Z'),'America/New_York'));
 j.setReminders({enabled:false,breakfast:null,lunch:null,dinner:null,alarms:[]},j.reminders().version);assert.equal(s.backup().journal.alarmDeliveries.length,0);
});

test('recommended carbohydrate/fat are daily target values, separate from historical upper limits',t=>{
 const {s}=setup(t);const p=s.journal.setPersonalInfo({goalText:'균형 있게 먹기',sex:'male',age:30,heightCm:180,weightKg:80},1);
 assert.equal(p.carbRecommended,342);assert.equal(p.fatRecommended,83);assert.ok(p.carbRecommended!<p.carbMax!);assert.ok(p.fatRecommended!<p.fatMax!);
 const female=nutritionEstimate({sex:'female',age:30,heightCm:180,weightKg:80})!;assert.equal(female.calories,2260);assert.equal(female.carbRecommended,311);assert.equal(female.fatRecommended,75);
 const backup=s.backup();s.restore(backup,()=>{});assert.equal(s.journal.nutrition().carbRecommended,342);
 assert.equal(nutritionEstimate({sex:null,age:30,heightCm:180,weightKg:80}),null);
});
