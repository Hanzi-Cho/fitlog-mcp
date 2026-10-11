import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {helpTour} from '../../src/domain/helpTour.js';
type Box={x:number;y:number;width:number;height:number};
type Layout={target:Box;card:Box;close:Box};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(v,Math.max(min,max)));
const overlaps=(a:Box,b:Box,gap=8)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;

/** One anchored coachmark. The modal owns scrolling until the tour closes. */
export function HelpOverlay({onClose,onRevealSettings}:{onClose:()=>void;onRevealSettings:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),measure=useRef<HTMLDivElement>(null),confirm=useRef<HTMLButtonElement>(null);
 const [group,setGroup]=useState(0),[page,setPage]=useState(0),[leaving,setLeaving]=useState(false),[layout,setLayout]=useState<Layout|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),closing=useRef(false);
 const item=helpTour[group];
 useLayoutEffect(()=>{
  const before=document.activeElement as HTMLElement|null,root=document.documentElement;
  root.classList.add('help-tour-active');dialog.current?.showModal();
  // overflow:hidden keeps programmatic step navigation possible. Block trackpad/touch
  // scroll chaining too, including nested lists, without altering their stable gutters.
  const stop=(e:Event)=>e.preventDefault();
  document.addEventListener('wheel',stop,{passive:false});document.addEventListener('touchmove',stop,{passive:false});
  return()=>{if(timer.current)clearTimeout(timer.current);document.removeEventListener('wheel',stop);document.removeEventListener('touchmove',stop);root.classList.remove('help-tour-active');dialog.current?.close();before?.focus({preventScroll:true});};
 },[]);
 function transition(action:()=>void){if(timer.current)clearTimeout(timer.current);setLeaving(true);timer.current=setTimeout(action,matchMedia('(prefers-reduced-motion: reduce)').matches?0:180);}
 function close(){closing.current=true;transition(onClose);}
 function next(){if(leaving)return;transition(()=>{if(page+1<item.pages.length)setPage(p=>p+1);else if(group+1<helpTour.length){setLayout(null);setPage(0);setGroup(g=>g+1);}else{onClose();return;}setLeaving(false);});}
 useLayoutEffect(()=>{
  if('settings' in item)onRevealSettings();
  let scrolled=false,frame=0,observed:HTMLElement|null=null;
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
  const observer=new ResizeObserver(schedule);
  const update=()=>{
   const target=document.querySelector<HTMLElement>(item.selector);
   if(!target||!measure.current)return;
   if(observed!==target){if(observed)observer.unobserve(observed);observer.observe(target);observed=target;}
   if(!scrolled){target.scrollIntoView({block:item.side==='top'?'end':'center',inline:'nearest',behavior:'instant'});if(item.side==='top')window.scrollBy({top:12,behavior:'instant'});scrolled=true;}
   const r=target.getBoundingClientRect(),w=document.documentElement.clientWidth,h=innerHeight,margin=12,gap=16,topMargin=w>=480?12:52;
   const x=clamp(r.left-4,4,w-4),y=clamp(r.top-4,4,h-4);
   const t={x,y,width:Math.max(0,Math.min(r.right+4,w-4)-x),height:Math.max(0,Math.min(r.bottom+4,h-4)-y)};
   const areas=[
    {side:'left',x:margin,y:52,width:t.x-gap-margin,height:h-64},
    {side:'right',x:t.x+t.width+gap,y:52,width:w-(t.x+t.width+gap)-margin,height:h-64},
    {side:'top',x:margin,y:topMargin,width:w-2*margin,height:t.y-gap-topMargin},
    {side:'bottom',x:margin,y:t.y+t.height+gap,width:w-2*margin,height:h-(t.y+t.height+gap)-margin},
   ];
   // Measure every page at the candidate width. Never shrink text into a scroll box.
   // Horizontal placements can use a wider card to fit a short laptop viewport.
   const candidates=areas.filter(a=>a.width>=160&&a.height>0).map(area=>{
    const width=Math.min(area.width,area.side==='left'||area.side==='right'?300:420);
    measure.current!.style.width=`${width}px`;
    const height=Math.ceil(Math.max(...Array.from(measure.current!.children).map(e=>e.getBoundingClientRect().height)));
    return {...area,cardWidth:width,cardHeight:height};
   });
   const fits=candidates.filter(a=>a.cardHeight<=a.height);
   const area=fits.find(a=>a.side===item.side&&a.cardWidth>=220)??fits.sort((a,b)=>b.cardWidth-a.cardWidth)[0]??candidates.sort((a,b)=>(a.cardHeight-a.height)-(b.cardHeight-b.height))[0];
   if(!area)return;
   const card={x:clamp(r.left+r.width/2-area.cardWidth/2,area.x,area.x+area.width-area.cardWidth),y:clamp(r.top+r.height/2-area.cardHeight/2,area.y,area.y+area.height-area.cardHeight),width:area.cardWidth,height:area.cardHeight};
   // Keep X in the upper right region, moving it left when the gear is spotlighted.
   const slots=Array.from({length:Math.ceil((w-24)/44)},(_,i)=>({x:w-48-i*44,y:8,width:36,height:36})).filter(b=>b.x>=8);
   const close=slots.find(b=>!overlaps(b,t)&&!overlaps(b,card))??{x:w-48,y:8,width:36,height:36};
   const next={target:t,card,close};setLayout(old=>JSON.stringify(old)===JSON.stringify(next)?old:next);
  };
  const mutation=new MutationObserver(()=>{if(!observed)schedule();});mutation.observe(document.getElementById('root')!,{childList:true,subtree:true});
  update();window.addEventListener('resize',schedule);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();mutation.disconnect();window.removeEventListener('resize',schedule);};
 },[group]);
 useEffect(()=>{if(layout&&!leaving&&!closing.current)confirm.current?.focus({preventScroll:true});},[group,page,!!layout,leaving]);
 const t=layout?.target,c=layout?.card;
 const from=c&&t?{x:clamp(t.x+t.width/2,c.x,c.x+c.width),y:clamp(t.y+t.height/2,c.y,c.y+c.height)}:null;
 const to=t&&from?{x:clamp(from.x,t.x,t.x+t.width),y:clamp(from.y,t.y,t.y+t.height)}:null;
 return <dialog ref={dialog} className="help-overlay guided-help" aria-label="Fitlog 도움말" onCancel={e=>{e.preventDefault();close();}} onKeyDown={e=>{if(e.key==='Tab'){const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('.help-close, [data-help-topic] button:not(:disabled)'));const index=buttons.indexOf(document.activeElement as HTMLButtonElement);e.preventDefault();buttons[(index+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus({preventScroll:true});}if(['PageDown','PageUp','Home','End','ArrowUp','ArrowDown',' '].includes(e.key)&&e.target===e.currentTarget)e.preventDefault();if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}}}>
  <button className="help-close" style={{left:layout?.close.x??'calc(100% - 48px)',top:8}} aria-label="도움말 전체 닫기" onClick={close}>×</button>
  {t&&<svg className={`help-spotlight ${closing.current&&leaving?'leaving':''}`} aria-hidden="true"><defs><mask id="help-hole"><rect width="100%" height="100%" fill="white"/><rect x={t.x} y={t.y} width={t.width} height={t.height} rx="12" fill="black"/></mask></defs><rect width="100%" height="100%" fill="rgba(0,0,0,.38)" mask="url(#help-hole)"/><rect className="help-highlight" x={t.x} y={t.y} width={t.width} height={t.height} rx="12"/>{from&&to&&<path className="help-pointer" d={`M${from.x} ${from.y} L${to.x} ${to.y}`}/>}</svg>}
  <div ref={measure} className="help-measure" aria-hidden="true">{item.pages.map((text,i)=><div className="help-bubble" key={i}><div className="help-copy"><p><strong>{item.title}</strong>{text}</p></div><footer><span>{i+1}/{item.pages.length}</span><span className="help-measure-button">확인</span></footer></div>)}</div>
  {c&&<section key={`${group}-${page}`} data-help-topic={item.id} data-help-page={page+1} className={`help-bubble ${leaving?'leaving':''}`} style={{left:c.x,top:c.y,width:c.width,height:c.height}} aria-label={item.title}>
   <div className="help-copy"><p aria-live="polite"><strong>{item.title}</strong>{item.pages[page]}</p></div><footer><span aria-label="이 기능의 도움말 순서">{page+1}/{item.pages.length}</span><button ref={confirm} disabled={leaving} onClick={next} aria-label={`${item.title} 도움말 확인`}>확인</button></footer>
  </section>}
 </dialog>;
}
