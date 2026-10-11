import type {Alarm} from '../contracts/experience.js';
export function localParts(now:Date,timezone:string){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));return {date:`${p.year}-${p.month}-${p.day}`,time:`${p.hour}:${p.minute}`};}
function localEpoch(date:string,time:string,tz:string){const target=Date.parse(`${date}T${time}:00Z`);let guess=target;for(let i=0;i<4;i++){const p=localParts(new Date(guess),tz),shown=Date.parse(`${p.date}T${p.time}:00Z`);if(shown===target)return guess;guess+=target-shown;}return null;}
/** Latest due occurrence only; missed interval ticks do not flood the UI. */
export function dueOccurrence(a:Alarm,now:Date,tz:string):string|null{
 if(!a.enabled)return null;const p=localParts(now,tz),weekday=new Date(p.date+'T00:00Z').getUTCDay();
 if(a.kind==='weekdays')return a.days.includes(weekday)&&p.time>=a.time&&localEpoch(p.date,a.time,tz)!==null?`${a.id}:${p.date}:${a.time}`:null;
 const anchor=localEpoch(a.startDate,a.time,tz);if(anchor===null||now.getTime()<anchor)return null;
 if(a.kind==='once')return `${a.id}:once:${a.startDate}:${a.time}`;
 if(a.unit==='days'){const diff=(Date.parse(p.date)-Date.parse(a.startDate))/86400000;return diff%a.every===0&&p.time>=a.time?`${a.id}:${p.date}:${a.time}`:null;}
 const period=a.every*(a.unit==='hours'?3600000:60000),tick=Math.floor((now.getTime()-anchor)/period);return `${a.id}:${anchor+tick*period}`;
}
