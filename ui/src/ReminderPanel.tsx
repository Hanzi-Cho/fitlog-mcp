import {useEffect,useState} from 'react';
import {call} from './bridge.js';
import {AlarmRow} from './AlarmRow.js';
import {useAutosave} from './useAutosave.js';
import {ScrollArea} from './ScrollArea.js';
import type {Alarm} from '../../src/contracts/experience.js';
type Preferences={enabled:boolean;breakfast:string|null;lunch:string|null;dinner:string|null;alarms:Alarm[];version:number};
function AlarmEditor({initial,today}:{initial:Preferences;today:string}){
 const {draft:p,update,pending,error,retry}=useAutosave(initial,async p=>{const {version,...reminders}=p;return call<Preferences>('update_check_reminders',{reminders,expectedVersion:version});},()=>window.dispatchEvent(new Event('fitlog:reminders-changed')));
 const edit=(id:string,patch:Partial<Alarm>)=>update({alarms:p.alarms.map(a=>a.id===id?{...a,...patch}:a)});
 return <div className="alarm-editor" aria-busy={pending}><ScrollArea className="alarm-list">{p.alarms.map(a=><AlarmRow key={a.id} alarm={a} onEdit={patch=>edit(a.id,patch)} onRemove={()=>update({alarms:p.alarms.filter(x=>x.id!==a.id)})}/>)}</ScrollArea><button disabled={p.alarms.length>=30} className="add-alarm" onClick={()=>update({alarms:[...p.alarms,{id:crypto.randomUUID(),name:'새 알림',enabled:false,kind:'weekdays',days:[0,1,2,3,4,5,6],startDate:today,time:'21:00',every:1,unit:'days'}]})}>＋ 알림 추가</button>{error&&<p role="alert">{error}<button onClick={retry}>다시 저장</button></p>}<p className="data-note">앱을 열어두면 알려드려요. 휴대폰 알림은 추후 지원할 예정이에요.</p></div>;
}
export function ReminderPanel({today,onOpen,compact=false}:{today:string;onOpen:()=>void;compact?:boolean}){
 const [prefs,setPrefs]=useState<Preferences|null>(null),[due,setDue]=useState(''),[error,setError]=useState('');
 useEffect(()=>{if(compact)return;let alive=true;void call<Preferences>('get_check_reminders').then(p=>{if(alive)setPrefs(p);}).catch(e=>{if(alive)setError(String(e));});return()=>{alive=false;};},[compact]);
 useEffect(()=>{if(!compact)return;let alive=true,busy=false;const tick=async()=>{if(busy||document.hidden)return;busy=true;try{const events=await call<{alarm:Alarm;occurrence:string}[]>('claim_due_alarms');if(!alive)return;if(events.length)setDue(events.map(e=>e.alarm.name).join(' · '));}catch{/* A later open-app tick retries without claiming a successful delivery. */}finally{busy=false;}};void tick();const timer=setInterval(()=>void tick(),15000),changed=()=>void tick();window.addEventListener('fitlog:reminders-changed',changed);return()=>{alive=false;clearInterval(timer);window.removeEventListener('fitlog:reminders-changed',changed);};},[compact,today]);
 if(compact)return due?<aside className="notice" role="status"><strong>{due}</strong><button onClick={onOpen}>오늘 체크하기</button><button onClick={()=>setDue('')}>닫기</button></aside>:null;
 return <section className="journal-reminders">{error&&<p role="alert">{error}</p>}{prefs?<AlarmEditor initial={prefs} today={today}/>:<p>알림을 불러오는 중…</p>}</section>;
}
