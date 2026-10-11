import {Checks, JournalPanel} from './JournalPanel.js';
import {DailyMetrics} from './DailyMetrics.js';
import {ReminderPanel} from './ReminderPanel.js';
import {useState} from 'react';
import type {FitlogService} from '../../src/application/service.js';

type Snapshot = ReturnType<FitlogService['snapshot']>;
export function Compact({snapshot,onOpen,onRefresh,onCheck,busy}:{
 snapshot:Snapshot;onOpen:(date?:string,task?:string)=>void;onRefresh:()=>Promise<void>;
 onCheck:(args:Record<string,unknown>)=>Promise<void>;busy:boolean;
}) {
 const [offset,setOffset]=useState(0),[selected,setSelected]=useState(snapshot.today);
 const month=new Date(Date.UTC(Number(snapshot.today.slice(0,4)),Number(snapshot.today.slice(5,7))-1+offset,1));
 const year=month.getUTCFullYear(),m=month.getUTCMonth();
 const dates=Array.from({length:new Date(Date.UTC(year,m+1,0)).getUTCDate()},(_,i)=>new Date(Date.UTC(year,m,i+1)).toISOString().slice(0,10));
 const goals=new Map(snapshot.goals.days.map(d=>[d.date,d]));
 const tasks=snapshot.todayChecklist,done=tasks.filter(t=>t.status==='yes').length;
 return <main className="compact" aria-label="Fitlog 미니 대시보드">
  <header className="compact-header"><strong>Fitlog</strong><time>{snapshot.today}</time><nav aria-label="대시보드 도구"><button disabled={busy} onClick={()=>void onRefresh()} aria-label="기록 새로고침">↻</button><button onClick={()=>onOpen(selected)}>상세 보기 ↗</button></nav></header>
  <div className="daily-overview">
   <section className="checklist-column" aria-label="오늘 체크리스트"><h2>오늘 체크리스트</h2><div className="checklist-scroll"><Checks date={snapshot.today} busy={busy} checks={tasks.map(t=>({localDate:snapshot.today,slot:t.id as 'workout'|'breakfast'|'lunch'|'dinner',status:t.status as 'yes'|'no'|'unwritten',occurrence:t.occurrence as 'unknown'|'completed'|'skipped'|'planned',version:t.version,note:t.note}))} onSave={onCheck}/></div></section>
   <DailyMetrics longest={snapshot.progress.longestStreak} current={snapshot.progress.currentStreak} done={done} total={tasks.length}/>
  </div>
  <ReminderPanel today={snapshot.today} compact onOpen={()=>document.querySelector('.checklist-column')?.scrollIntoView({behavior:'smooth'})}/>
  <div className="compact-bottom">
   <section className="mini-month" aria-label="한 달 잔디">
    <div className="mini-month-head"><button aria-label="이전 달" onClick={()=>setOffset(o=>o-1)}>‹</button><strong>{year}.{String(m+1).padStart(2,'0')}</strong><button aria-label="다음 달" disabled={offset>=0} onClick={()=>setOffset(o=>o+1)}>›</button></div>
    <div className="mini-grid">{['일','월','화','수','목','금','토'].map(d=><span className="weekday" key={d}>{d}</span>)}{Array.from({length:month.getUTCDay()},(_,i)=><span key={`blank${i}`}/>)}{dates.map(date=>{const d=goals.get(date),count=d?.completed??0,total=d?.total??snapshot.goals.total;return <button key={date} className={`mini-day level-${d?.level??0}`} aria-label={`${date} 목표 ${count}/${total}`} title={`${date} · 목표 ${count}/${total}`} aria-pressed={date===selected} disabled={date>snapshot.today} onClick={()=>setSelected(date)}>{Number(date.slice(-2))}</button>;})}</div>
    <p className="mini-legend">적음 {[0,1,2,3,4].map(n=><i key={n} className={`level-${n}`}/>)} 모두 달성</p>
   </section>
   <JournalPanel date={selected} revision={snapshot.revision} mode="compact" onRefresh={onRefresh}/>
  </div>
 </main>;
}
