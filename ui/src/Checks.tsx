import {useEffect,useState} from 'react';
import {TaskForm,type TaskValues} from './TaskForm.js';
import type {Check} from '../../src/contracts/experience.js';
const names={workout:'운동',breakfast:'아침 식사',lunch:'점심 식사',dinner:'저녁 식사'};
function BinaryControl({label,checked,busy,onSave}:{label:string;checked:boolean;busy:boolean;onSave:(value:boolean)=>Promise<void>}){
 const [optimistic,setOptimistic]=useState<boolean|null>(null);
 return <input className="goal-checkbox" type="checkbox" aria-label={`${label} 달성`} checked={optimistic??checked} disabled={busy||optimistic!==null} onChange={e=>{const value=e.target.checked;setOptimistic(value);void onSave(value).finally(()=>setOptimistic(null));}}/>;
}
function CountControl({check,busy,onSave}:{check:Check;busy:boolean;onSave:(count:number)=>Promise<void>}){
 const [draft,setDraft]=useState(String(check.count));
 useEffect(()=>setDraft(String(check.count)),[check.count,check.version]);
 const save=()=>{const value=Number(draft);if(!Number.isInteger(value)||value<0||value>1000000){setDraft(String(check.count));return;}if(value!==check.count)void onSave(value);};
 return <label className="count-control"><input aria-label={`${check.label||names[check.slot as keyof typeof names]} 달성 횟수`} type="number" min="0" max="1000000" step="1" disabled={busy} value={draft} onChange={e=>setDraft(e.target.value)} onFocus={e=>e.target.select()} onBlur={save} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/><span>/{check.target}</span></label>;
}
export function Checks({checks,busy,onSave,onRemove,onEdit}:{checks:Check[];busy:boolean;onSave:(args:Record<string,unknown>)=>Promise<void>;onRemove:(id:string)=>void;onEdit:(id:string,goal:TaskValues)=>Promise<boolean>}){
 const [editing,setEditing]=useState<string|null>(null);
 return <div className="journal-checks">{checks.map(c=>{
  const slot=c.slot;
  const label=c.label||names[slot as keyof typeof names]||'작업';
  const save=(patch:Record<string,unknown>)=>{const {version,...check}=c;return onSave({check:{...check,...patch},expectedVersion:version});};
  return <div key={slot}>{editing===slot?<TaskForm initial={{label,controlType:c.controlType,target:c.target}} editing busy={busy} onSave={goal=>onEdit(slot,goal)} onCancel={()=>setEditing(null)}/>:<div className="journal-check"><span className={c.status==='yes'?'check-label achieved':'check-label'}>{label}</span>{c.controlType==='count'?<CountControl check={c} busy={busy} onSave={count=>save({count})}/>:<BinaryControl label={label} checked={c.status==='yes'} busy={busy} onSave={value=>save({status:value?'yes':'no',occurrence:value?'completed':c.occurrence==='planned'?'unknown':c.occurrence})}/>}<button className="edit-task" disabled={busy} aria-label={label+' 수정'} title="작업 수정" onClick={()=>setEditing(slot)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-5-5L3 15l-1 5Z"/></svg></button><button className="remove-task" disabled={busy} aria-label={label+' 제거'} title="작업 제거" onClick={()=>onRemove(slot)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg></button></div>}</div>;
 })}</div>;
}
