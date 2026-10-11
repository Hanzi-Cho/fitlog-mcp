import {useEffect,useRef,useState} from 'react';
/** Debounce edits, serialize versioned writes, drain a newer draft after an in-flight save. */
export function useAutosave<T extends {version:number}>(initial:T,save:(draft:T)=>Promise<T>,onSaved:()=>void){
 const [draft,setDraft]=useState(initial),[pending,setPending]=useState(false),[error,setError]=useState('');
 const state=useRef({draft:initial,version:initial.version,seq:0,saved:0,busy:false,alive:true,timer:0});
 const callbacks=useRef({save,onSaved});callbacks.current={save,onSaved};
 const flush=async()=>{const s=state.current;if(s.busy||s.seq===s.saved)return;s.busy=true;if(s.alive)setPending(true);const seq=s.seq;let success=false;try{const next=await callbacks.current.save({...s.draft,version:s.version});s.version=next.version;s.saved=seq;success=true;if(seq===s.seq){s.draft=next;if(s.alive)setDraft(next);}else s.draft={...s.draft,version:next.version};if(s.alive){setError('');setPending(seq!==s.seq);}callbacks.current.onSaved();}catch(e){if(s.alive){setError(e instanceof Error?e.message:'저장하지 못했어요.');setPending(false);}}finally{s.busy=false;if(success&&s.seq!==s.saved)void flush();}};
 useEffect(()=>{state.current.alive=true;return()=>{const s=state.current;s.alive=false;clearTimeout(s.timer);void flush();};},[]);
 function update(patch:Partial<T>){const s=state.current;s.draft={...s.draft,...patch};s.seq++;setDraft(s.draft);setError('');setPending(true);clearTimeout(s.timer);s.timer=window.setTimeout(()=>void flush(),500);}
 return {draft,update,pending,error,retry:()=>void flush()};
}
