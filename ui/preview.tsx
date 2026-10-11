import { useState } from 'react';

type RecordItem = { id: number; date: string; type: 'workout' | 'meal'; title: string };
const today = '2026-10-10';
const initialRecords: RecordItem[] = Array.from({ length: 283 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 0, i + 1)).toISOString().slice(0, 10);
  return (i % 7 === 0 || (i % 11 === 0 && i < 276)) ? [] : [
    ...(i % 3 !== 0 ? [{ id: i * 2, date, type: 'workout' as const, title: i % 2 ? '가볍게 걷기 · 30분' : '전신 근력 운동 · 40분' }] : []),
    ...(i % 2 === 0 ? [{ id: i * 2 + 1, date, type: 'meal' as const, title: '점심 · 현미밥과 닭가슴살' }] : []),
  ];
}).flat();
function metrics(records: RecordItem[]) {
  const days = [...new Set(records.map(r => r.date))].sort();
  let longest = 0, run = 0, previous = -Infinity;
  for (const day of days) { const n = Date.parse(day) / 86400000; run = n === previous + 1 ? run + 1 : 1; longest = Math.max(longest, run); previous = n; }
  const dates = new Set(days); let cursor = Date.parse(today), current = 0;
  if (!dates.has(today)) cursor -= 86400000;
  while (dates.has(new Date(cursor).toISOString().slice(0, 10))) { current++; cursor -= 86400000; }
  return [days.length, current, longest];
}
export function DashboardPreview() {
  const [records, setRecords] = useState(initialRecords);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('month');
  const [month, setMonth] = useState(10);
  const [selected, setSelected] = useState(today);
  const [form, setForm] = useState<'workout' | 'meal' | null>(null);
  const [title, setTitle] = useState('');
  const [notice, setNotice] = useState('');
  const visible = records.filter(r => filter === 'all' || r.type === filter);
  const stats = metrics(visible);
  const selectedRecords = visible.filter(r => r.date === selected);
  const start = view === 'year' ? Date.UTC(2026, 0, 1) : Date.UTC(2026, month - 1, 1);
  const length = view === 'year' ? 365 : new Date(Date.UTC(2026, month, 0)).getUTCDate();
  const offset = new Date(start).getUTCDay();
  const dates = Array.from({ length }, (_, i) => new Date(start + i * 86400000).toISOString().slice(0, 10));
  const dayMap = new Map<string, Set<string>>();
  visible.forEach(r => { if (!dayMap.has(r.date)) dayMap.set(r.date, new Set()); dayMap.get(r.date)!.add(r.type); });
  return <div className="dashboard">
    <div className="preview-banner"><span>UI 미리보기 · 합성 데이터</span><span>저장되지 않는 화면 시안</span></div>
    <header className="profile"><div className="avatar" aria-hidden="true">F</div><div><div className="eyebrow">FITLOG / PERSONAL SPACE</div><h1>나의 꾸준함을 기록하다</h1><p>샘플 사용자 <span>@fitlog-demo · Asia/Seoul</span></p></div><span className="local-badge">개인 공간</span></header>
    <div className="filter" aria-label="기록 종류">{[['all', '전체'], ['workout', '운동'], ['meal', '식단']].map(([key, label]) => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</div>
    <section className="stats" aria-label="실천 지표">{['누적 기록일', '현재 연속', '최장 연속'].map((label, i) => <div key={label}><span>{label}</span><p><strong>{stats[i]}</strong> 일</p></div>)}</section>
    <section className="today"><div><div className="eyebrow">TODAY · 2026.10.10</div><h2>오늘의 작은 기록</h2><p>운동 한 번, 식사 한 끼부터 남겨보세요.</p></div><div className="actions"><button onClick={() => { setForm('workout'); setTitle(''); }}>＋ 운동</button><button onClick={() => { setForm('meal'); setTitle(''); }}>＋ 식단</button></div></section>
    {form && <form className="sample-form" onSubmit={e => { e.preventDefault(); if (!title.trim()) return; setRecords(r => [...r, { id: Date.now(), date: today, type: form, title: title.trim() }]); setSelected(today); setFilter('all'); setForm(null); setNotice('샘플 기록을 화면에 추가했습니다. 실제 DB에는 저장하지 않았습니다.'); }}><label htmlFor="sample-title">오늘의 {form === 'workout' ? '운동' : '식단'} · 시험 입력</label><input id="sample-title" autoFocus required maxLength={160} value={title} onChange={e => setTitle(e.target.value)} placeholder={form === 'workout' ? '예: 산책 20분' : '예: 점심 비빔밥'}/><div className="actions"><button type="submit">시안에 추가</button><button type="button" onClick={() => setForm(null)}>취소</button></div></form>}
    <p className="notice" role="status">{notice}</p>
    <section className="activity"><div className="section-head"><div><div className="eyebrow">ACTIVITY</div><h2>꾸준함의 발자국</h2></div><div className="actions"><button aria-pressed={view === 'month'} onClick={() => setView('month')}>월</button><button aria-pressed={view === 'year'} onClick={() => setView('year')}>연간</button></div></div>
      <div className="calendar-label"><strong>2026년 {view === 'month' ? `${month}월` : '활동'}</strong>{view === 'month' && <label>월 선택 <select value={month} onChange={e => setMonth(Number(e.target.value))}>{Array.from({length:12}, (_, i) => <option key={i} value={i + 1}>{i + 1}월</option>)}</select></label>}</div>
      <div className="grid-scroll"><div className={`calendar ${view}`} aria-label="날짜별 기록">{Array.from({length:offset}, (_, i) => <span key={`blank-${i}`}/>)}{dates.map(date => { const kinds = dayMap.get(date); const level = kinds?.size ?? 0; const kindText = kinds ? [...kinds].map(t => t === 'workout' ? '운동' : '식단').join('·') : '기록 없음'; return <button key={date} className={`day level-${level}`} aria-label={`${date} ${kindText}`} title={`${date} · ${kindText}`} aria-pressed={selected === date} disabled={date > today} onClick={() => setSelected(date)}>{view === 'month' ? <><span>{Number(date.slice(-2))}</span><small>{level ? kindText : '·'}</small></> : <span className="sr-only">{date}</span>}</button>; })}</div></div>
      <p className="legend"><i className="level-0"/> 없음 <i className="level-1"/> 한 종류 <i className="level-2"/> 운동+식단 · 날짜를 눌러 상세 확인</p>
      <div className="day-detail"><strong>{selected.replaceAll('-', '.')} 기록</strong>{selectedRecords.length ? selectedRecords.map(r => <p key={r.id}><span className="tag">{r.type === 'workout' ? '운동' : '식단'}</span>{r.title}</p>) : <p>이 날짜에는 선택한 종류의 샘플 기록이 없습니다.</p>}</div>
    </section>
    <section className="recent"><div className="section-head"><h2>최근 기록</h2><span>샘플 이력</span></div>{[...visible].sort((a,b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0,3).map(r => <button className="record-row" key={r.id} onClick={() => { setSelected(r.date); setMonth(Number(r.date.slice(5,7))); }}><span className="tag">{r.type === 'workout' ? '운동' : '식단'}</span><span>{r.title}</span><time>{r.date.slice(5).replace('-', '.')}</time></button>)}</section>
    <footer><span>사용 중</span><span className="module">운동 기록</span><span className="module">식단 기록</span></footer>
    <p className="preview-note">사진 월렛·체중·일정·추가 플러그인은 후속 범위입니다. 이 화면은 승인된 MVP 배치를 확인하는 시안입니다.</p>
  </div>;
}
