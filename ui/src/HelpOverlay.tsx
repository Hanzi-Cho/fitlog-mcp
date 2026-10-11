import {useEffect,useRef,useState} from 'react';
import {helpTopics} from '../../src/domain/help.js';
import {ScrollArea} from './ScrollArea.js';

/** Native modal makes the underlying app inert and keeps keyboard focus inside. */
export function HelpOverlay({onClose}:{onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [dismissed,setDismissed]=useState<string[]>([]);
 const topics=helpTopics.filter(t=>!dismissed.includes(t.id));
 useEffect(()=>{const before=document.activeElement as HTMLElement|null;dialog.current?.showModal();return()=>{dialog.current?.close();before?.focus();};},[]);
 function dismiss(id:string){
  if(topics.length===1){onClose();return;}
  const next=topics.find(t=>t.id!==id)!;
  setDismissed(d=>[...d,id]);
  requestAnimationFrame(()=>document.getElementById(`help-confirm-${next.id}`)?.focus({preventScroll:true}));
 }
 return <dialog ref={dialog} className="help-overlay" aria-label="Fitlog 도움말" onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}}}>
  <button className="help-close" aria-label="도움말 전체 닫기" onClick={onClose}>×</button>
  <ScrollArea className="help-scroll"><div className="help-cards">{topics.map(t=><section className="help-card" key={t.id} data-help-topic={t.id} aria-label={t.title}><p><strong>{t.title}</strong>{t.description}</p><button id={`help-confirm-${t.id}`} onClick={()=>dismiss(t.id)} aria-label={`${t.title} 도움말 확인`}>확인</button></section>)}</div></ScrollArea>
 </dialog>;
}
