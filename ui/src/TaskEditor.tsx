import {useState} from 'react';
import {TaskForm,type TaskValues} from './TaskForm.js';
export function TaskEditor({busy,onAdd}:{busy:boolean;onAdd:(goal:TaskValues)=>Promise<boolean>}){const [open,setOpen]=useState(false);return open?<TaskForm busy={busy} onSave={onAdd} onCancel={()=>setOpen(false)}/>:<button className="add-task" disabled={busy} onClick={()=>setOpen(true)}>＋ 작업 추가하기</button>;}
