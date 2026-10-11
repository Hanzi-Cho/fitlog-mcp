import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root=mkdtempSync(join(tmpdir(),'fitlog-backup-test-'));
function run(dir,action,file){return spawnSync(process.execPath,[resolve('dist/backup.mjs'),action,file],{env:{...process.env,FITLOG_DATA_DIR:dir},encoding:'utf8'});}
const source=join(root,'source'),target=join(root,'target'),file=join(root,'backup.json');
assert.equal(run(source,'export',file).status,0);
const data=JSON.parse(readFileSync(file,'utf8'));assert.equal(data.schemaVersion,1);
assert.equal(run(source,'export',file).status,1,'Must not overwrite an existing backup');
assert.equal(run(target,'import',file).status,0);assert.equal(readdirSync(join(target,'backups')).length,1);
const result=join(root,'restored.json');assert.equal(run(target,'export',result).status,0);
const restored=JSON.parse(readFileSync(result,'utf8'));assert.equal(restored.profile.displayName,data.profile.displayName);assert.equal(restored.reminder.time,data.reminder.time);
const broken=join(root,'broken.json');writeFileSync(broken,'{broken');assert.equal(run(target,'import',broken).status,1);
const unsupported=join(root,'unsupported.json');writeFileSync(unsupported,JSON.stringify({...data,schemaVersion:999}));assert.equal(run(target,'import',unsupported).status,1);
assert.equal(readdirSync(join(target,'backups')).length,1,'Invalid imports must not mutate the target');
console.log('PASS: CLI export/import to a new directory, pre-restore backup, overwrite refusal and invalid JSON/schema rejection.');
