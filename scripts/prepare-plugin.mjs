import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await access(resolve(repo,'dist/main.mjs'));
const {version}=JSON.parse(await readFile(resolve(repo,'package.json'),'utf8'));
const root=resolve(repo,'.local/marketplace');
const plugin=resolve(root,'plugins/fitlog');
await mkdir(resolve(root,'.agents/plugins'),{recursive:true});
await mkdir(plugin,{recursive:true});
const write=(file,value)=>writeFile(file,JSON.stringify(value,null,2)+'\n');
await write(resolve(plugin,'plugin.json'),{$schema:'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',name:'fitlog',version,description:'Personal local workout and meal records with an embedded dashboard and reminder handoff.',repository:'https://github.com/Hanzi-Cho/fitlog-mcp',extensions:{'com.openai':{mcpServers:'./.mcp.json',interface:{displayName:'Fitlog',shortDescription:'운동·식단 기록과 실천 잔디',category:'Productivity',defaultPrompt:['Fitlog 대시보드를 열어줘','오늘의 운동과 식단을 기록해줘']}}}});
await write(resolve(plugin,'mcp.json'),{$schema:'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',mcpServers:{fitlog:{type:'stdio',command:process.execPath,args:[resolve(repo,'dist/main.mjs')]}}});
// The installed desktop build still discovers bundled local servers through
// the Codex compatibility manifest and .mcp.json, not portable mcp.json alone.
await mkdir(resolve(plugin,'.codex-plugin'),{recursive:true});
await write(resolve(plugin,'.codex-plugin/plugin.json'),{name:'fitlog',version,description:'Local workout and meal records with a compact dashboard.',mcpServers:'./.mcp.json',interface:{displayName:'Fitlog',shortDescription:'운동·식단 기록과 미니 대시보드',category:'Productivity',defaultPrompt:['Fitlog 대시보드를 열어줘']}});
await write(resolve(plugin,'.mcp.json'),{mcpServers:{fitlog:{command:process.execPath,args:[resolve(repo,'dist/main.mjs')],env_vars:['LOCALAPPDATA','USERPROFILE'],cwd:repo}}});
await write(resolve(root,'.agents/plugins/marketplace.json'),{name:'fitlog-personal',plugins:[{name:'fitlog',source:{source:'local',path:'./plugins/fitlog'},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'Productivity'}]});
console.log(root);
