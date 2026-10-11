import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { openDatabase, dataDirectory } from '../infrastructure/database.js';
import { FitlogService } from '../application/service.js';
import { publicError } from '../contracts/errors.js';
const [action, path] = process.argv.slice(2);
if (!['export','import'].includes(action ?? '') || !path) { console.error('Usage: node dist/backup.mjs export|import <file.json>'); process.exit(1); }
const dir=dataDirectory(); const db=openDatabase(dir); const service=new FitlogService(db);
try {
  if(action==='export') { writeFileSync(resolve(path),JSON.stringify(service.backup(),null,2),{flag:'wx',mode:0o600}); console.log('백업을 저장했습니다. 기존 파일은 덮어쓰지 않습니다.'); }
  else { if(statSync(path).size>50*1024*1024) throw Error('Backup too large'); const data=JSON.parse(readFileSync(path,'utf8')); const result=service.restore(data,snapshot=>{const backupDir=resolve(dir,'backups');mkdirSync(backupDir,{recursive:true});writeFileSync(resolve(backupDir,`before-restore-${Date.now()}-${randomUUID()}.json`),JSON.stringify(snapshot),{flag:'wx',mode:0o600});}); console.log(JSON.stringify(result)); }
} catch(error) { console.error(JSON.stringify(publicError(error)));process.exitCode=1; } finally {db.close();}
