import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {helpTour} from '../../src/domain/helpTour.js';
import {ScrollArea} from './ScrollArea.js';
type Box={x:number;y:number;width:number;height:number};
type Layout={target:Box;card:Box;side:string};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(v,Math.max(min,max)));

/** One anchored coachmark. Native modal keeps the real underlying UI inert. */
export function HelpOverlay({onClose,onRevealSettings}:{onClose:()=>void;onRevealSettings:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),measure=useRef<HTMLDivElement>(null),confirm=useRef<HTMLButtonElement>(null);
 const [group,setGroup]=useState(0),[page,setPage]=useState(0),[leaving,setLeaving]=useState(false),[layout,setLayout]=useState<Layout|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),closing=useRef(false);
 const item=helpTour[group];
 useEffect(()=>{const before=document.activeElement as HTMLElement|null;dialog.current?.showModal();return()=>{if(timer.current)clearTimeout(timer.current);dialog.current?.close();before?.focus({preventScroll:true});};},[]);
 function transition(action:()=>void){if(timer.current)clearTimeout(timer.current);setLeaving(true);timer.current=setTimeout(action,matchMedia('(prefers-reduced-motion: reduce)').matches?0:180);}
 function close(){closing.current=true;transition(onClose);}
 function next(){if(leaving)return;transition(()=>{if(page+1<item.pages.length)setPage(p=>p+1);else if(group+1<helpTour.length){setLayout(null);setPage(0);setGroup(g=>g+1);}else{onClose();return;}setLeaving(false);});}
 useLayoutEffect(()=>{
  if('settings' in item)onRevealSettings();
  let scrolled=false,frame=0;
  const update=()=>{
   const target=document.querySelector<HTMLElement>(item.selector);
   if(!target||!measure.current){frame=requestAnimationFrame(update);return;}
   if(!scrolled){target.scrollIntoView({block:item.side==='top'?'end':'center',inline:'nearest',behavior:'instant'});if(item.side==='top')window.scrollBy({top:12,behavior:'instant'});scrolled=true;}
   const r=target.getBoundingClientRect(),w=innerWidth,h=innerHeight,margin=12,gap=16;
   const t={x:clamp(r.left-4,4,w-8),y:clamp(r.top-4,4,h-8),width:Math.min(r.width+8,w-8),height:Math.min(r.height+8,h-8)};
   const areas=[
    {side:'left',x:margin,y:52,width:t.x-gap-margin,height:h-64},
    {side:'right',x:t.x+t.width+gap,y:52,width:w-(t.x+t.width+gap)-margin,height:h-64},
    {side:'top',x:margin,y:52,width:w-2*margin,height:t.y-gap-52},
    {side:'bottom',x:margin,y:t.y+t.height+gap,width:w-2*margin,height:h-(t.y+t.height+gap)-margin},
   ];
   const available=areas.filter(a=>a.width>=160&&a.height>=80);
   // Prefer the opposite dashboard column. On narrow screens use free space above/below.
   const area=available.find(a=>a.side===item.side&&a.width>=220&&a.height>=160)??available.sort((a,b)=>Math.min(b.width,300)*b.height-Math.min(a.width,300)*a.height)[0];
   if(!area){frame=requestAnimationFrame(update);return;}
   const width=Math.min(area.width,300);measure.current.style.width=`${width}px`;
   const height=Math.min(area.height,Math.max(...Array.from(measure.current.children).map(e=>e.getBoundingClientRect().height)));
   const card={x:clamp(r.left+r.width/2-width/2,area.x,area.x+area.width-width),y:clamp(r.top+r.height/2-height/2,area.y,area.y+area.height-height),width,height};
   const next={target:t,card,side:area.side};setLayout(old=>JSON.stringify(old)===JSON.stringify(next)?old:next);
  };
  update();const observer=new ResizeObserver(update);observer.observe(document.body);
  const mutation=new MutationObserver(()=>{if(!layout)update();});mutation.observe(document.getElementById('root')!,{childList:true,subtree:true});
  window.addEventListener('resize',update);window.addEventListener('scroll',update,true);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();mutation.disconnect();window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);};
 },[group]);
 useEffect(()=>{if(layout&&!leaving&&!closing.current)confirm.current?.focus({preventScroll:true});},[group,page,!!layout,leaving]);
 const t=layout?.target,c=layout?.card;
 const from=c&&t?{x:clamp(t.x+t.width/2,c.x,c.x+c.width),y:clamp(t.y+t.height/2,c.y,c.y+c.height)}:null;
 const to=t&&from?{x:clamp(from.x,t.x,t.x+t.width),y:clamp(from.y,t.y,t.y+t.height)}:null;
 return <dialog ref={dialog} className="help-overlay guided-help" aria-label="Fitlog 도움말" onCancel={e=>{e.preventDefault();close();}} onKeyDown={e=>{if(e.key==='Tab'){const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('.help-close, [data-help-topic] button:not(:disabled)'));const index=buttons.indexOf(document.activeElement as HTMLButtonElement);e.preventDefault();buttons[(index+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus({preventScroll:true});}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}}}>
  <button className="help-close" aria-label="도움말 전체 닫기" onClick={close}>×</button>
  {t&&<svg className={`help-spotlight ${closing.current&&leaving?'leaving':''}`} aria-hidden="true"><defs><mask id="help-hole"><rect width="100%" height="100%" fill="white"/><rect x={t.x} y={t.y} width={t.width} height={t.height} rx="12" fill="black"/></mask></defs><rect width="100%" height="100%" fill="rgba(0,0,0,.38)" mask="url(#help-hole)"/><rect className="help-highlight" x={t.x} y={t.y} width={t.width} height={t.height} rx="12"/>{from&&to&&<path className="help-pointer" d={`M${from.x} ${from.y} L${to.x} ${to.y}`}/>}</svg>}
  <div ref={measure} className="help-measure" aria-hidden="true">{item.pages.map((text,i)=><div className="help-bubble" key={i}><ScrollArea className="help-copy"><p><strong>{item.title}</strong>{text}</p></ScrollArea><footer><span>{i+1}/{item.pages.length}</span><span className="help-measure-button">확인</span></footer></div>)}</div>
  {c&&<section key={`${group}-${page}`} data-help-topic={item.id} data-help-page={page+1} className={`help-bubble ${leaving?'leaving':''}`} style={{left:c.x,top:c.y,width:c.width,height:c.height}} aria-label={item.title}>
   <ScrollArea className="help-copy"><p aria-live="polite"><strong>{item.title}</strong>{item.pages[page]}</p></ScrollArea><footer><span aria-label="이 기능의 도움말 순서">{page+1}/{item.pages.length}</span><button ref={confirm} disabled={leaving} onClick={next} aria-label={`${item.title} 도움말 확인`}>확인</button></footer>
  </section>}
 </dialog>;
}
