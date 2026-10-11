import type { DatabaseSync } from 'node:sqlite';
import { activitySchema, type Activity } from '../contracts/schemas.js';
export class FitlogRepository {
  constructor(private db:DatabaseSync){}
  transaction<T>(fn:()=>T,write=true):T { this.db.exec(write?'BEGIN IMMEDIATE':'BEGIN');try{const result=fn();this.db.exec('COMMIT');return result;}catch(e){this.db.exec('ROLLBACK');throw e;} }
  initialize(key:string,value:unknown){this.db.prepare('INSERT OR IGNORE INTO settings VALUES(?,?)').run(key,JSON.stringify(value));}
  setting(key:string):unknown{return JSON.parse(String(this.db.prepare('SELECT json FROM settings WHERE key=?').get(key)!.json));}
  saveSetting(key:string,value:unknown){this.db.prepare('UPDATE settings SET json=? WHERE key=?').run(JSON.stringify(value),key);}
  bump(){this.db.prepare("UPDATE settings SET json=CAST(CAST(json AS INTEGER)+1 AS TEXT) WHERE key='revision'").run();}
  all():Activity[]{return this.db.prepare('SELECT json FROM activities ORDER BY localDate DESC,id DESC').all().map(r=>activitySchema.parse(JSON.parse(String(r.json))));}
  get(id:string):Activity|undefined{const row=this.db.prepare('SELECT json FROM activities WHERE id=?').get(id);return row?activitySchema.parse(JSON.parse(String(row.json))):undefined;}
  insert(a:Activity){this.db.prepare('INSERT INTO activities VALUES(?,?,?,?)').run(a.id,a.localDate,a.type,JSON.stringify(a));}
  update(a:Activity){this.db.prepare('UPDATE activities SET localDate=?,type=?,json=? WHERE id=?').run(a.localDate,a.type,JSON.stringify(a),a.id);}
  delete(id:string){this.db.prepare('DELETE FROM activities WHERE id=?').run(id);}
  idempotency(key:string){const row=this.db.prepare('SELECT hash,resultId FROM idempotency WHERE key=?').get(key);return row?{hash:String(row.hash),resultId:String(row.resultId)}:undefined;}
  addIdempotency(key:string,hash:string,resultId:string){this.db.prepare('INSERT INTO idempotency VALUES(?,?,?)').run(key,hash,resultId);}
  allIdempotency(){return this.db.prepare('SELECT key,hash,resultId FROM idempotency').all().map(r=>({key:String(r.key),hash:String(r.hash),resultId:String(r.resultId)}));}
  clearRecords(){this.db.exec('DELETE FROM activities; DELETE FROM idempotency;');}
  list(where:string[],params:(string|number)[]):Activity[]{return this.db.prepare(`SELECT json FROM activities WHERE ${where.join(' AND ')} ORDER BY localDate DESC,id DESC LIMIT ?`).all(...params).map(r=>activitySchema.parse(JSON.parse(String(r.json))));}
}
