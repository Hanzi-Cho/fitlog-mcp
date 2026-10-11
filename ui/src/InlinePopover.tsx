import {useEffect,useId,useRef,type ReactNode} from 'react';
/** Native top-layer popover avoids clipping inside ScrollArea; supports Escape/light dismissal. */
export function InlinePopover({label,text,children}:{label:string;text:ReactNode;children:ReactNode}){
 const id=useId(),popup=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 function position(){const el=popup.current,button=trigger.current;if(!el||!button||!el.matches(':popover-open'))return;const r=button.getBoundingClientRect();el.style.left=`${Math.max(8,Math.min(r.left,innerWidth-el.offsetWidth-8))}px`;el.style.top=`${r.bottom+6+el.offsetHeight<=innerHeight-8?r.bottom+6:Math.max(8,r.top-el.offsetHeight-6)}px`;}
 useEffect(()=>{const el=popup.current;if(!el)return;const observer=new ResizeObserver(position);observer.observe(el);window.addEventListener('resize',position);window.addEventListener('scroll',position,true);return()=>{observer.disconnect();window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);};},[]);
 return <div className="inline-popover"><button ref={trigger} type="button" className="alarm-value" aria-label={label} popoverTarget={id}>{text}</button><div id={id} ref={popup} popover="auto" onToggle={position} onKeyDown={e=>{if(e.key==='Escape')e.stopPropagation();}} className="alarm-popover" role="dialog" aria-label={label+' 편집'}>{children}<button className="popover-done" type="button" onClick={()=>popup.current?.hidePopover()}>완료</button></div></div>;
}
