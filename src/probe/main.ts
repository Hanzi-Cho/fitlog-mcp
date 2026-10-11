import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Isolated synthetic G0 probe. It never opens the production health database.
const dataDir = resolve(process.env.FITLOG_PROBE_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), '../.local/probe'));
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(resolve(dataDir, 'probe.sqlite'));
db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000; CREATE TABLE IF NOT EXISTS probe (id INTEGER PRIMARY KEY, value INTEGER NOT NULL); INSERT OR IGNORE INTO probe VALUES (1,0);');
const uri = 'ui://fitlog/probe/v1.html';
const server = new McpServer({ name: 'fitlog-probe', version: '0.1.0' });
const result = () => ({ content: [{ type: 'text' as const, text: 'Fitlog 합성 데이터 연결 시험. 실제 건강 기록이 아닙니다.' }], structuredContent: { synthetic: true, count: Number(db.prepare('SELECT value FROM probe WHERE id=1').get()!.value) } });
registerAppResource(server, 'Fitlog G0 probe', uri, {}, async () => ({ contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: readFileSync(new URL('./probe.html', import.meta.url), 'utf8'), _meta: { ui: { prefersBorder: true, csp: { connectDomains: [], resourceDomains: [] } } } }] }));
registerAppTool(server, 'open_fitlog_probe', { title: 'Fitlog 임베디드 연결 시험', description: 'Open the synthetic Fitlog G0 UI to verify embedded rendering in Codex. No personal data.', inputSchema: z.object({}), annotations: { readOnlyHint: true, openWorldHint: false }, _meta: { ui: { resourceUri: uri } } }, async () => result());
server.registerTool('increment_fitlog_probe', { description: 'Increment the isolated synthetic connectivity counter by one. Not a health record.', inputSchema: z.object({}), annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false } }, async () => { db.prepare('UPDATE probe SET value=value+1 WHERE id=1').run(); return result(); });
server.registerTool('report_fitlog_probe_ui', { description: 'Report that the actual embedded UI has initialized. Used only by the test UI.', inputSchema: z.object({ hostName: z.string().max(100), hostVersion: z.string().max(100) }), annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false } }, async (args) => { appendFileSync(resolve(dataDir, 'ui-evidence.jsonl'), JSON.stringify({ ...args, at: new Date().toISOString(), event: 'ui-initialized' }) + '\n'); return result(); });
await server.connect(new StdioServerTransport());
process.on('SIGINT', () => { db.close(); process.exit(0); });
