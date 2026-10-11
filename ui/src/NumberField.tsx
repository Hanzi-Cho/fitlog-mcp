import {useEffect,useState} from 'react';
/** Keep intermediate typing (e.g. 8 → 80) local; persist only valid numbers. */
export function NumberField({label,value,min,max,step='1',onChange}:{label:string;value:number|null;min:number;max:number;step?:string;onChange:(value:number|null)=>void}){
 const [text,setText]=useState(value===null?'':String(value));
 useEffect(()=>setText(value===null?'':String(value)),[value]);
 return <input aria-label={label} type="number" min={min} max={max} step={step} value={text} onChange={e=>{setText(e.target.value);if(e.target.value==='')onChange(null);else if(e.target.validity.valid)onChange(Number(e.target.value));}} onBlur={e=>{if(!e.target.validity.valid)setText(value===null?'':String(value));}}/>;
}
