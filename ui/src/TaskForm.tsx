import {useState} from 'react';
export type TaskValues={label:string;controlType:'binary'|'count';target:number};
export function TaskForm({initial,busy,onSave,onCancel,editing=false}:{initial?:TaskValues;busy:boolean;onSave:(goal:TaskValues)=>Promise<boolean>;onCancel:()=>void;editing?:boolean}){
 const [label,setLabel]=useState(initial?.label??''),[type,setType]=useState<TaskValues['controlType']>(initial?.controlType??'binary'),[target,setTarget]=useState(String(initial?.target??100));
 return <form className="task-editor" onSubmit={e=>{e.preventDefault();void onSave({label:label.trim(),controlType:type,target:type==='count'?Number(target):1}).then(ok=>{if(ok)onCancel();});}}>
 <input aria-label={editing?'작업 이름 수정':'새 작업 이름'} autoFocus required maxLength={80} value={label} onChange={e=>setLabel(e.target.value)} placeholder="작업 이름" disabled={busy}/>
 <div className="task-editor-options"><select aria-label={editing?'작업 유형 수정':'새 작업 유형'} value={type} disabled={busy} onChange={e=>setType(e.target.value as TaskValues['controlType'])}><option value="binary">완료 여부</option><option value="count">목표 횟수</option></select>{type==='count'&&<input aria-label="목표 횟수" type="number" min="1" max="1000000" step="1" required value={target} disabled={busy} onChange={e=>setTarget(e.target.value)}/>}</div>
 <div className="task-editor-actions"><button type="submit" disabled={busy||!label.trim()}>{editing?'수정 완료':'추가'}</button><button type="button" disabled={busy} onClick={onCancel}>취소</button></div></form>;
}
