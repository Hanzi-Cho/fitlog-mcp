import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const dir = await mkdtemp(resolve(tmpdir(), 'fitlog-g0-'));
async function connect() {
  const client = new Client({ name: 'fitlog-g0-protocol-test', version: '0.1.0' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [resolve('dist/probe.mjs')], env: { ...Object.fromEntries(Object.entries(process.env).filter(([,v]) => v !== undefined)), FITLOG_PROBE_DIR: dir }, stderr: 'pipe' });
  await client.connect(transport);
  return client;
}
let client = await connect();
try {
  const list = await client.listTools();
  const open = list.tools.find(t => t.name === 'open_fitlog_probe');
  assert.ok(open);
  assert.equal(open._meta.ui.resourceUri, 'ui://fitlog/probe/v1.html');
  const resource = await client.readResource({ uri: open._meta.ui.resourceUri });
  assert.equal(resource.contents[0].mimeType, 'text/html;profile=mcp-app');
  assert.ok(resource.contents[0].text.includes('id="root"'));
  const first = await client.callTool({ name: 'open_fitlog_probe', arguments: {} });
  assert.equal(first.structuredContent.count, 0);
  const changed = await client.callTool({ name: 'increment_fitlog_probe', arguments: {} });
  assert.equal(changed.structuredContent.count, 1);
  // Deliberately do not invoke UI evidence reporting from a protocol-only test.
  await client.close();
  client = await connect();
  const persisted = await client.callTool({ name: 'open_fitlog_probe', arguments: {} });
  assert.equal(persisted.structuredContent.count, 1);
  let noUiEvidence = false;
  try { await readFile(resolve(dir, 'ui-evidence.jsonl')); } catch (e) { if(e.code === 'ENOENT') noUiEvidence = true; else throw e; }
  assert.ok(noUiEvidence);
  console.log('PASS: MCP initialization, discovery, UI resource metadata, synthetic SQLite write/read, restart persistence. Actual Codex rendering NOT tested.');
} finally { await client.close(); }
