import type {Alarm} from '../../src/contracts/experience.js';
import {InlinePopover} from './InlinePopover.js';
import {NumberField} from './NumberField.js';
const days=['일','월','화','수','목','금','토'];
export function alarmSummary(a:Alarm){if(a.kind==='once')return `${Number(a.startDate.slice(5,7))}/${Number(a.startDate.slice(8))} 한 번`;if(a.kind==='interval')return `${a.every}${{minutes:'분',hours:'시간',days:'일'}[a.unit]}마다`;return a.days.length===7?'매일':`매주 ${[1,2,3,4,5,6,0].filter(d=>a.days.includes(d)).map(d=>days[d]).join(' ')}`;}
export function AlarmRow({alarm:a,onEdit,onRemove}:{alarm:Alarm;onEdit:(patch:Partial<Alarm>)=>void;onRemove:()=>void}){
 return <div className="alarm-row" aria-label={a.name+' 알림'}>
 <InlinePopover label="알림 반복" text={alarmSummary(a)}><div className="recurrence-choices" aria-label="반복 방식">{([['daily','매일'],['weekly','매주'],['once','한 번'],['interval','간격']] as const).map(([kind,label])=><button type="button" key={kind} aria-pressed={kind==='daily'?a.kind==='weekdays'&&a.days.length===7:kind==='weekly'?a.kind==='weekdays'&&a.days.length<7:a.kind===kind} onClick={()=>onEdit(kind==='daily'?{kind:'weekdays',days:[0,1,2,3,4,5,6]}:kind==='weekly'?{kind:'weekdays',days:a.days.length===7?[1,3,5]:a.days}:{kind})}>{label}</button>)}</div>
 {a.kind==='weekdays'&&<div className="alarm-days">{days.map((d,i)=><button type="button" key={d} aria-label={d+'요일'} aria-pressed={a.days.includes(i)} onClick={()=>{const next=a.days.includes(i)?a.days.filter(n=>n!==i):[...a.days,i];if(next.length)onEdit({days:next});}}>{d}</button>)}</div>}
 {a.kind==='once'&&<label>날짜<input aria-label="알림 날짜" type="date" value={a.startDate} onChange={e=>{if(e.target.value)onEdit({startDate:e.target.value});}}/></label>}
 {a.kind==='interval'&&<><div className="alarm-interval"><NumberField label="알림 간격" min={1} max={10000} value={a.every} onChange={every=>{if(every!==null)onEdit({every});}}/>{(['minutes','hours','days'] as const).map(unit=><button key={unit} type="button" aria-pressed={a.unit===unit} onClick={()=>onEdit({unit})}>{{minutes:'분',hours:'시간',days:'일'}[unit]}</button>)}</div><label>시작 날짜<input aria-label="간격 시작 날짜" type="date" value={a.startDate} onChange={e=>{if(e.target.value)onEdit({startDate:e.target.value});}}/></label></>}
 </InlinePopover>
 <InlinePopover label="알림 시간" text={<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>{a.time}</span></>}><label>시간<input aria-label="시간 변경" type="time" value={a.time} onChange={e=>{if(e.target.value)onEdit({time:e.target.value});}}/></label></InlinePopover>
 <input className="alarm-name" aria-label="알림 이름" maxLength={80} value={a.name} onChange={e=>onEdit({name:e.target.value})}/><button className="alarm-toggle" type="button" aria-pressed={a.enabled} aria-label={a.name+' 활성 상태'} onClick={()=>onEdit({enabled:!a.enabled})}>{a.enabled?'활성':'비활성'}</button><button className="alarm-remove" type="button" aria-label={a.name+' 알림 제거'} onClick={onRemove}>×</button>
 </div>;
}
