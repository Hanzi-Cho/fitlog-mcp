import {Checks} from './Checks.js';
import {Imagebook} from './Imagebook.js';
import {DailyMetrics} from './DailyMetrics.js';
import {ReminderPanel} from './ReminderPanel.js';
import {TaskEditor} from './TaskEditor.js';
import {useState} from 'react';
import type {FitlogService} from '../../src/application/service.js';

type Snapshot = ReturnType<FitlogService['snapshot']>;
export function Compact({snapshot,onOpen,onRefresh,onCheck,onTask,busy}:{
 snapshot:Snapshot;onOpen:(date?:string,task?:string)=>void;onRefresh:()=>Promise<void>;
 onTask:(name:string,args:Record<string,unknown>)=>Promise<boolean>;onCheck:(args:Record<string,unknown>)=>Promise<void>;busy:boolean;
}) {
 const [offset,setOffset]=useState(0),[selection,setSelected]=useState<string|null>(null);
 const selected=selection??snapshot.today;
 const month=new Date(Date.UTC(Number(snapshot.today.slice(0,4)),Number(snapshot.today.slice(5,7))-1+offset,1));
 const year=month.getUTCFullYear(),m=month.getUTCMonth();
 const dates=Array.from({length:new Date(Date.UTC(year,m+1,0)).getUTCDate()},(_,i)=>new Date(Date.UTC(year,m,i+1)).toISOString().slice(0,10));
 const goals=new Map(snapshot.goals.days.map(d=>[d.date,d]));
 const tasks=snapshot.todayChecklist,done=tasks.filter(t=>t.status==='yes').length;
 return <main className="compact" aria-label="Fitlog 미니 대시보드">
  <header className="compact-header"><h1>오늘의 체크리스트</h1><button className="config-button" onClick={()=>onOpen()} aria-label="프로필 및 설정" title="프로필 및 설정"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m9 3-.6 2.1-1.7 1L4.5 5.6 2.8 8.5l1.6 1.6v2l-1.6 1.6 1.7 2.9 2.2-.5 1.7 1L9 19.2h3.4l.6-2.1 1.7-1 2.2.5 1.7-2.9-1.6-1.6v-2l1.6-1.6-1.7-2.9-2.2.5-1.7-1L12.4 3Z" transform="translate(1 1)"/><circle cx="11.7" cy="12.1" r="3"/></svg></button></header>
  <div className="daily-overview">
   <DailyMetrics longest={snapshot.progress.longestStreak} current={snapshot.progress.currentStreak} done={done} total={tasks.length}/>
   <section className="checklist-column" aria-label="오늘 체크리스트"><div className="checklist-scroll"><Checks busy={busy} checks={tasks.map(t=>({localDate:snapshot.today,slot:t.id,controlType:t.controlType,label:t.label,count:t.count,target:t.target,status:t.status as 'yes'|'no'|'unwritten',occurrence:t.occurrence as 'unknown'|'completed'|'skipped'|'planned',version:t.version,note:t.note}))} onSave={onCheck} onRemove={id=>void onTask('remove_goal',{id,expectedVersion:snapshot.goalConfigVersion})}/><TaskEditor busy={busy} onAdd={goal=>onTask('add_goal',{goal,expectedVersion:snapshot.goalConfigVersion})}/></div></section>
  </div>
  <ReminderPanel today={snapshot.today} compact onOpen={()=>document.querySelector('.checklist-column')?.scrollIntoView({behavior:'smooth'})}/>
  <div className="compact-bottom">
   <section className="mini-month" aria-label="한 달 잔디">
    <div className="mini-month-head"><button aria-label="이전 달" onClick={()=>setOffset(o=>o-1)}>‹</button><strong>{year}.{String(m+1).padStart(2,'0')}</strong><button aria-label="다음 달" disabled={offset>=0} onClick={()=>setOffset(o=>o+1)}>›</button></div>
    <div className="mini-grid">{['일','월','화','수','목','금','토'].map(d=><span className="weekday" key={d}>{d}</span>)}{Array.from({length:month.getUTCDay()},(_,i)=><span key={`blank${i}`}/>)}{dates.map(date=>{const d=goals.get(date),count=d?.completed??0,total=d?.total??[...snapshot.goalHistory].reverse().find(r=>r.fromDate<=date)?.goals.length??snapshot.goals.total;return <button key={date} className={`mini-day level-${d?.level??0}`} aria-label={`${date} 목표 ${count}/${total}`} title={`${date} · 목표 ${count}/${total}`} aria-pressed={date===selected} disabled={date>snapshot.today} onClick={()=>{if(date===selected&&date!==snapshot.today){setSelected(null);setOffset(0);}else setSelected(date===snapshot.today?null:date);}}>{Number(date.slice(-2))}</button>;})}</div>
   </section>
   <Imagebook date={selected} today={snapshot.today} revision={snapshot.revision}/>
  </div>
 </main>;
}
