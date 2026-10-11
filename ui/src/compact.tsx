import {Checks} from './JournalPanel.js';
import { useState, type CSSProperties } from 'react';
import type { FitlogService } from '../../src/application/service.js';

type Snapshot = ReturnType<FitlogService['snapshot']>;
export function Compact({snapshot, onOpen, onRefresh, onOverlay, onReview, onCheck, busy}: {
 snapshot: Snapshot; onOpen:(date?:string, task?:string)=>void; onRefresh:()=>void;
 onOverlay:()=>void; onReview:()=>void; onCheck:(args:Record<string,unknown>)=>Promise<void>; busy:boolean;
}) {
 const [page,setPage]=useState(0),[offset,setOffset]=useState(0),[selected,setSelected]=useState(snapshot.today);
 const current=new Date(`${snapshot.today}T00:00:00Z`);
 const month=new Date(Date.UTC(current.getUTCFullYear(),current.getUTCMonth()+offset,1));
 const year=month.getUTCFullYear(),m=month.getUTCMonth();
 const dates=Array.from({length:new Date(Date.UTC(year,m+1,0)).getUTCDate()},(_,i)=>new Date(Date.UTC(year,m,i+1)).toISOString().slice(0,10));
 const map=new Map(snapshot.progress.days.map(d=>[d.date,d]));
 const tasks=snapshot.todayChecklist;
 const done=tasks.filter(t=>t.status==='yes').length;
 const chosen=map.get(selected);
 return <section className="compact" aria-label="Fitlog 미니 대시보드">
  <header className="compact-header"><strong>Fitlog <span>하루의 작은 기록</span></strong><nav aria-label="대시보드 도구"><button disabled={busy} onClick={onRefresh} aria-label="기록 새로고침">↻</button><button onClick={onOverlay}>오버레이</button><button onClick={()=>onOpen()}>전체 보기 ↗</button></nav></header>
  <div className="compact-body">
   <section className="mini-month" aria-label="한 달 잔디">
    <div className="mini-month-head"><button aria-label="이전 달" onClick={()=>setOffset(o=>o-1)}>‹</button><strong>{year}.{String(m+1).padStart(2,'0')}</strong><button aria-label="다음 달" disabled={offset>=0} onClick={()=>setOffset(o=>o+1)}>›</button></div>
    <div className="mini-grid">{['일','월','화','수','목','금','토'].map(d=><span className="weekday" key={d}>{d}</span>)}{Array.from({length:month.getUTCDay()},(_,i)=><span key={`blank${i}`}/>)}{dates.map(date=>{const d=map.get(date);return <button key={date} className={`mini-day level-${Number(!!d?.workout)+Number(!!d?.meal)}`} aria-label={`${date} 운동 ${d?.workout??0} 식단 ${d?.meal??0}`} aria-pressed={date===selected} disabled={date>snapshot.today} onClick={()=>{setSelected(date);setPage(2);}}>{Number(date.slice(-2))}</button>;})}</div>
    <p className="mini-legend">옅음 · 한 종류 <span/> 진함 · 운동+식단</p>
   </section>
   <section className="mini-details" aria-label="세부 정보">
    <div className="mini-page-head"><h2>{['오늘 체크리스트','기록과 달성','날짜 기록 · 리뷰'][page]}</h2><div className="pager"><button aria-label="이전 정보" onClick={()=>setPage(p=>(p+2)%3)}>‹</button><span aria-live="polite">{page+1} / 3</span><button aria-label="다음 정보" onClick={()=>setPage(p=>(p+1)%3)}>›</button></div></div>
    <div className="mini-page" key={page}>
     {page===0&&<><Checks date={snapshot.today} busy={busy} checks={tasks.map(t=>({localDate:snapshot.today,slot:t.id as 'workout'|'breakfast'|'lunch'|'dinner',status:t.status as 'yes'|'no'|'unwritten',occurrence:t.occurrence as 'unknown'|'completed'|'skipped'|'planned',version:t.version,note:t.note}))} onSave={onCheck}/><p className="mini-hint">오늘 목표 준수 {done}/{tasks.length} · 기록 존재와 별도로 확인합니다.</p></>}
     {page===1&&<div className="mini-metrics"><div className="streaks"><p>최다 연속 기록<strong>{snapshot.progress.longestStreak}<small> 일</small></strong></p><p>현재 연속 기록<strong>{snapshot.progress.currentStreak}<small> 일</small></strong></p></div><div className="completion"><div className="completion-ring" role="img" aria-label={`오늘 목표 ${tasks.length}개 중 ${done}개 준수`} style={{'--completion':`${done/tasks.length*360}deg`} as CSSProperties}><strong>{done}<small>/{tasks.length}</small></strong></div><span>오늘 목표 준수</span></div></div>}
     {page===2&&<div className="mini-summary"><time>{selected}</time><p>운동 <strong>{chosen?.workout??0}</strong> · 식단 <strong>{chosen?.meal??0}</strong></p><div><button onClick={()=>onOpen(selected)}>이 날짜 보기</button><button disabled={busy} onClick={onReview}>7일 리뷰</button></div><small>리뷰는 채팅에서 이어집니다.</small></div>}
    </div>
   </section>
  </div>
 </section>;
}
