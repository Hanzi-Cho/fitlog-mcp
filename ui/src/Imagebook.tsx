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
 useEffect(()=>{const n=++generation.current;setError('');if(day?.localDate!==date){setDay(null);setPhoto(null);selectedId.current=null;known.current=[];setIndex(0);}
  void call<Day>('get_day_journal',{localDate:date}).then(d=>{if(n!==generation.current||date!==activeDate.current)return;const ids=d.photos.map(p=>p.id),added=ids.filter(id=>!known.current.includes(id));const current=selectedId.current;const chosen=known.current.length&&added.length?added.at(-1):current;const next=chosen?ids.indexOf(chosen):0;setIndex(Math.max(0,next));known.current=ids;setDay(d);}).catch(()=>{if(n===generation.current)setError('사진을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.');});
  return()=>{generation.current++;};
 },[date,revision]);
 useEffect(()=>{let cancelled=false;const id=day?.photos[index]?.id;selectedId.current=id??null;setPhoto(previous=>previous?.id===id?previous:null);if(id)void call<Photo>('get_meal_photo',{id}).then(p=>{if(!cancelled)setPhoto(p);}).catch(()=>{if(!cancelled)setError('사진을 불러오지 못했어요.');});return()=>{cancelled=true;};},[day,index]);
 if(!day)return <section className="imagebook" aria-label="식사 이미지북"><p className="empty" role="status">{error||'사진을 불러오는 중…'}</p></section>;
 if(!day.photos.length)return <section className="imagebook imagebook-empty" aria-label="식사 이미지북"><p className="empty">아직 사진이 없어요</p></section>;
 const title=photo?.title||(photo?`${date===today?'오늘':`${Number(date.slice(5,7))}월 ${Number(date.slice(8,10))}일`}의 ${meals[photo.mealType]}`:'');
 return <section className="imagebook" aria-label="식사 이미지북">
  <div className="imagebook-heading"><h3>{title}</h3>{photo?.analysis&&<span className="meal-calories">약 {Math.round(photo.analysis.calories)} kcal</span>}</div>
  {photo?<div className="imagebook-frame"><img src={`data:${photo.mimeType};base64,${photo.data}`} alt={title}/></div>:<p role="status">사진을 불러오는 중…</p>}
  <div className="meal-footer"><div className="nutrition-pills" aria-label="영양 피드백">{photo?.analysis?photo.analysis.feedback.map((f,i)=><span className={`nutrition-pill feedback-${f.code}`} key={i}>{f.code==='meal_suggestion'?f.text||feedbackLabels[f.code]:feedbackLabels[f.code]}</span>):<span className="nutrition-pill pending">분석 대기</span>}</div>{day.photos.length>1&&<nav className="imagebook-nav" aria-label="사진 넘기기"><button aria-label="이전 사진" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>‹</button><span>{index+1}/{day.photos.length}</span><button aria-label="다음 사진" disabled={index>=day.photos.length-1} onClick={()=>setIndex(i=>i+1)}>›</button></nav>}</div>
  {error&&<p role="alert">{error}</p>}
 </section>;
}

