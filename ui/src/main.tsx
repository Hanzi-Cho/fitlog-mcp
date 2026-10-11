import {createRoot} from 'react-dom/client';
import {useEffect,useRef,useState} from 'react';
import type {FitlogService} from '../../src/application/service.js';
import {call,connect} from './bridge.js';
import {Compact} from './compact.js';
import {ConfigPanel} from './ConfigPanel.js';
type Snapshot=ReturnType<FitlogService['snapshot']>;
function Dashboard(){
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[config,setConfig]=useState(false);
 const sequence=useRef(0),locked=useRef(false),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 async function refresh(){const seq=++sequence.current;try{await connect();const s=await call<Snapshot>('open_dashboard',{timezone:Intl.DateTimeFormat().resolvedOptions().timeZone});if(alive.current&&seq===sequence.current){setSnapshot(s);setError('');}}catch(e){if(alive.current&&seq===sequence.current)setError(e instanceof Error?e.message:'기록을 불러오지 못했습니다.');}}
 useEffect(()=>{void refresh();const timer=setInterval(()=>{if(!document.hidden&&!locked.current)void refresh();},15000);const focus=()=>{if(!locked.current)void refresh();};window.addEventListener('focus',focus);return()=>{clearInterval(timer);window.removeEventListener('focus',focus);};},[]);
 async function mutate(name:string,args:Record<string,unknown>):Promise<boolean>{if(locked.current)return false;locked.current=true;setBusy(true);setError('');try{await call(name,args);await refresh();return true;}catch(e){await refresh();setError(e instanceof Error?e.message:'기록을 저장하지 못했습니다.');return false;}finally{locked.current=false;setBusy(false);}}
 return <>{snapshot?<><Compact snapshot={snapshot} busy={busy} onTask={mutate} onCheck={async args=>{await mutate('set_day_check',args);}} onRefresh={refresh} onOpen={()=>setConfig(c=>!c)}/>{config&&<ConfigPanel snapshot={snapshot} onClose={()=>setConfig(false)} onSaved={refresh}/>}</>:<p className="compact-feedback" role="status">기록을 불러오는 중…</p>}{error&&<p className="compact-feedback" role="alert">{error}<button onClick={()=>void refresh()}>다시 연결</button></p>}</>;
}
createRoot(document.getElementById('root')!).render(<Dashboard/>);
