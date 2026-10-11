import {useEffect,useState} from 'react';
import type {FitlogService} from '../../src/application/service.js';
import type {Nutrition} from '../../src/contracts/experience.js';
import {nutritionEstimate} from '../../src/domain/nutrition.js';
import {call} from './bridge.js';
import {ReminderPanel} from './ReminderPanel.js';
import {NumberField} from './NumberField.js';
import {useAutosave} from './useAutosave.js';
type Snapshot=ReturnType<FitlogService['snapshot']>;
function PersonalInfo({initial,onSaved}:{initial:Nutrition;onSaved:()=>Promise<void>}){
 const {draft:p,update,pending,error,retry}=useAutosave(initial,async p=>call<Nutrition>('update_personal_info',{profile:{goalText:p.goalText,sex:p.sex,age:p.age,heightCm:p.heightCm,weightKg:p.weightKg},expectedVersion:p.version}),()=>void onSaved());
 const n=nutritionEstimate(p);
 return <section className="personal-info" aria-label="개인정보" aria-busy={pending}><h3>개인정보</h3><div className="personal-fields"><label className="goal-field">나의 목표<input maxLength={300} value={p.goalText} placeholder="매일 꾸준히 운동하고 균형 있게 먹기" onChange={e=>update({goalText:e.target.value})}/></label><label>성별<select aria-label="성별" value={p.sex??''} onChange={e=>update({sex:(e.target.value||null) as Nutrition['sex']})}><option value="">선택</option><option value="male">남성</option><option value="female">여성</option></select></label>{([['age','나이',18,120,'1'],['heightCm','키 (cm)',50,250,'0.1'],['weightKg','체중 (kg)',20,400,'0.1']] as const).map(([key,label,min,max,step])=><label key={key}>{label}<NumberField label={label} min={min} max={max} step={step} value={p[key]} onChange={value=>update({[key]:value})}/></label>)}</div>
 <dl className="nutrition-summary">{[['하루 권장 칼로리',n?.calories,'kcal'],['하루 최소 단백질',n?.proteinMin,'g'],['탄수화물 권장량',n?.carbRecommended,'g'],['지방 권장량',n?.fatRecommended,'g']].map(([label,value,unit])=><div key={label}><dt>{label}</dt><dd>{value===undefined?'—':`${value} ${unit}`}</dd></div>)}</dl>
 <p className="exercise-note">권장 운동량: 주 150–300분 중강도 유산소 · 근력 운동 주 2일 이상</p>{error&&<p role="alert">{error}<button onClick={retry}>다시 저장</button></p>}</section>;
}
export function ConfigPanel({snapshot,onClose,onSaved}:{snapshot:Snapshot;onClose:()=>void;onSaved:()=>Promise<void>}){
 const [nutrition,setNutrition]=useState<Nutrition|null>(null),[error,setError]=useState('');
 useEffect(()=>{let cancelled=false;void call<{nutrition:Nutrition}>('get_day_journal',{localDate:snapshot.today}).then(d=>{if(!cancelled)setNutrition(d.nutrition);}).catch(e=>{if(!cancelled)setError(String(e));});return()=>{cancelled=true;};},[snapshot.today]);
 useEffect(()=>{const before=document.activeElement as HTMLElement|null;document.getElementById('close-config')?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);before?.focus();};},[]);
 return <section className="config-panel" aria-label="프로필 및 설정"><header><h2>{snapshot.profile.displayName}의 프로필 <small>@{snapshot.profile.handle}</small></h2><button id="close-config" onClick={onClose} aria-label="설정 닫기">×</button></header>{error&&<p role="alert">{error}</p>}{nutrition?<PersonalInfo initial={nutrition} onSaved={onSaved}/>:<p role="status">개인정보를 불러오는 중…</p>}<details><summary>알림 설정</summary><ReminderPanel today={snapshot.today} onOpen={onClose}/></details><p className="data-note">기록과 사진은 내 기기에 보관해요. 대화에서 공유한 내용은 AI가 참고해 기록을 도와줘요.</p></section>;
}
