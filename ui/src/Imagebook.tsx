import {useEffect,useRef,useState} from 'react';
import {call} from './bridge.js';
import type {Journal} from '../../src/application/journal.js';
import type {Photo} from '../../src/contracts/experience.js';
type Day=ReturnType<Journal['day']>;
const meals={breakfast:'아침식사',lunch:'점심식사',dinner:'저녁식사',snack:'간식'};
const feedbackLabels={balanced:'균형 잡힌 식사',protein_low:'단백질을 더해요',overeating:'양을 조금 줄여요',high_calorie:'칼로리가 높아요',vegetables_low:'채소를 더해요',meal_suggestion:'다음 식사 추천'};
export function Imagebook({date,today,revision}:{date:string;today:string;revision:number}){
 const [day,setDay]=useState<Day|null>(null),[photo,setPhoto]=useState<Photo|null>(null),[index,setIndex]=useState(0),[error,setError]=useState('');
 const generation=useRef(0),activeDate=useRef(date),selectedId=useRef<string|null>(null),known=useRef<string[]>([]);activeDate.current=date;
 const historical=date!==today,offset=historical?1:0,photoIndex=index-offset;
 useEffect(()=>{const n=++generation.current;setError('');if(day?.localDate!==date){setDay(null);setPhoto(null);selectedId.current=null;known.current=[];setIndex(0);}
  void call<Day>('get_day_journal',{localDate:date}).then(d=>{if(n!==generation.current||date!==activeDate.current)return;const ids=d.photos.map(p=>p.id),added=ids.filter(id=>!known.current.includes(id));if(day?.localDate===date){const chosen=known.current.length&&added.length?added.at(-1):selectedId.current;if(chosen){const found=ids.indexOf(chosen);setIndex(found>=0?found+offset:0);}else setIndex(i=>Math.min(i,Math.max(0,ids.length+offset-1)));}known.current=ids;setDay(d);}).catch(()=>{if(n===generation.current)setError('기록을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.');});
  return()=>{generation.current++;};
 },[date,revision,today]);
 useEffect(()=>{let cancelled=false;const id=day?.photos[photoIndex]?.id;selectedId.current=id??null;setPhoto(previous=>previous?.id===id?previous:null);if(id)void call<Photo>('get_meal_photo',{id}).then(p=>{if(!cancelled)setPhoto(p);}).catch(()=>{if(!cancelled)setError('사진을 불러오지 못했어요.');});return()=>{cancelled=true;};},[day,photoIndex]);
 const empty=(text:string)=><div className="imagebook-placeholder"><p role="status">{text}</p></div>;
 if(!day||day.localDate!==date)return <section className="imagebook" aria-label="식사 이미지북">{empty(error||'기록을 불러오는 중…')}</section>;
 const pages=offset+day.photos.length,title=photo?.title||(photo?`${date===today?'오늘':`${Number(date.slice(5,7))}월 ${Number(date.slice(8,10))}일`}의 ${meals[photo.mealType]}`:'');
 const history=historical&&index===0;
 return <section className="imagebook" aria-label="식사 이미지북">
  {history?<div className="day-achievements" aria-label={`${date} 달성 내역`}><h3>{Number(date.slice(5,7))}월 {Number(date.slice(8,10))}일의 달성 내역</h3><ul>{day.goals.map(g=>{const c=day.checks.find(c=>c.slot===g.id),type=c?.controlType??g.controlType,count=c?.count??0,target=c?.target??g.target,done=type==='count'?count>=target:c?.status==='yes';return <li key={g.id}><span>{c?.label||g.label}</span><span className={done?'history-done':'history-incomplete'} aria-label={done?'달성':'미달성'}>{type==='count'?`${count}/${target}`:done?'✓':'—'}</span></li>;})}</ul>{!day.goals.length&&<p>등록된 작업이 없어요</p>}</div>:day.photos.length?<><div className="imagebook-heading"><h3>{title}</h3>{photo?.analysis&&<span className="meal-calories">약 {Math.round(photo.analysis.calories)} kcal</span>}</div>{photo?<div className="imagebook-frame"><img src={`data:${photo.mimeType};base64,${photo.data}`} alt={title}/></div>:empty('사진을 불러오는 중…')}<div className="nutrition-pills" aria-label="영양 피드백">{photo?.analysis?photo.analysis.feedback.map((f,i)=><span className={`nutrition-pill feedback-${f.code}`} key={i}>{f.code==='meal_suggestion'?f.text||feedbackLabels[f.code]:feedbackLabels[f.code]}</span>):<span className="nutrition-pill pending">분석 대기</span>}</div></>:empty('아직 사진이 없어요')}
  {pages>1&&<nav className="imagebook-nav" aria-label="날짜 기록 넘기기"><button aria-label="이전 기록" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>‹</button><span>{index+1}/{pages}</span><button aria-label="다음 기록" disabled={index>=pages-1} onClick={()=>setIndex(i=>i+1)}>›</button></nav>}{error&&<p role="alert">{error}</p>}
 </section>;
}
