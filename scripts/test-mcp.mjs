import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
const dir=mkdtempSync(join(tmpdir(),'fitlog-mcp-test-'));
let client;
async function start(){client=new Client({name:'fitlog-integration',version:'1.0'});await client.connect(new StdioClientTransport({command:process.execPath,args:[resolve('dist/main.mjs')],env:{...process.env,FITLOG_DATA_DIR:dir},stderr:'pipe'}));}
async function call(name,args={}){return client.callTool({name,arguments:args});}
try{
 await start();const tools=await client.listTools();assert.equal(tools.tools.length,20);
 assert.equal(tools.tools.find(t=>t.name==='open_dashboard')._meta.ui.resourceUri,'ui://fitlog/dashboard/v0.1.2.html');
 assert.equal(tools.tools.find(t=>t.name==='open_dashboard').title,'Fitlog');
 assert.deepEqual(tools.tools.find(t=>t.name==='open_dashboard')._meta['openai/ui'].entrypoints,[{type:'global'},{type:'thread'}]);
 const resource=await client.readResource({uri:'ui://fitlog/dashboard/v0.1.2.html'});assert.deepEqual(resource.contents[0]._meta['openai/ui'].availableDisplayModes,['inline','pip','fullscreen']);assert.equal(resource.contents[0].mimeType,'text/html;profile=mcp-app');assert.ok(resource.contents[0].text.includes('<div id="root"></div><script>'), 'UI resource must contain an executable app root');
 const args={activity:{type:'meal',localDate:'2020-01-02',title:'합성 점심',mealType:'lunch'},idempotencyKey:'mcp-test-key-001'};
 const created=await call('create_activity',args);assert.equal(created.isError,undefined);const a=created.structuredContent.data.activity;
 assert.equal((await call('create_activity',args)).structuredContent.data.activity.id,a.id);
 const updated=await call('update_activity',{id:a.id,expectedVersion:1,activity:{...args.activity,title:'수정한 합성 점심'}});assert.equal(updated.structuredContent.data.version,2);
 const stale=await call('update_activity',{id:a.id,expectedVersion:1,activity:args.activity});assert.equal(stale.isError,true);assert.equal(stale.structuredContent.error.code,'CONFLICT');
 await client.close();await start();assert.equal((await call('open_dashboard')).structuredContent.data.recent.items[0].title,'수정한 합성 점심');
 assert.equal((await call('get_reminder_request')).structuredContent.data.registrationStatus,'not_verified');
 await call('delete_activity',{id:a.id,expectedVersion:2});assert.equal((await call('get_progress')).structuredContent.data.progress.recordedDays,0);
 assert.equal((await call('delete_activity',{id:a.id,expectedVersion:2})).structuredContent.data.alreadyDeleted,true);
 const date='2020-01-02';await call('set_day_check',{check:{localDate:date,slot:'lunch',status:'no',occurrence:'completed'},expectedVersion:0});assert.equal((await call('get_day_journal',{localDate:date})).structuredContent.data.checks[0].status,'no');assert.equal((await call('set_day_check',{check:{localDate:date,slot:'lunch',status:'yes',occurrence:'completed'},expectedVersion:0})).isError,true);await client.close();await start();assert.equal((await call('get_day_journal',{localDate:date})).structuredContent.data.checks[0].status,'no');assert.equal((await call('get_check_reminders')).structuredContent.data.enabled,false);
 console.log('PASS: real stdio MCP discovery, resource, CRUD, retry, conflict, restart persistence, progress and reminder contract. Host rendering/push not asserted.');
}finally{await client?.close();}
