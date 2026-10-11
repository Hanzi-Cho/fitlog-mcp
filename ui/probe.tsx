import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { App } from '@modelcontextprotocol/ext-apps';
import { DashboardPreview } from './preview.js';

const bridge = new App({ name: 'Fitlog G0 probe', version: '0.1.0' });
function Probe() {
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState('Codex 연결 중…');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    bridge.ontoolresult = (r) => { const v = (r.structuredContent as { count?: number } | undefined)?.count; if (typeof v === 'number') setCount(v); };
    bridge.connect().then(async () => {
      setReady(true); setStatus('호스트 연결됨 · 합성 데이터');
      const host = bridge.getHostVersion();
      const r = await bridge.callServerTool({ name: 'report_fitlog_probe_ui', arguments: { hostName: host?.name ?? 'unknown', hostVersion: host?.version ?? 'unknown' } });
      const v = (r.structuredContent as { count?: number } | undefined)?.count; if (typeof v === 'number') setCount(v);
    }).catch(() => setStatus('호스트 연결 실패 · 아직 G0 통과 아님'));
  }, []);
  async function increment() { setBusy(true); try { const r = await bridge.callServerTool({ name: 'increment_fitlog_probe', arguments: {} }); if(r.isError) throw Error(); setCount((r.structuredContent as { count: number }).count); setStatus('로컬 SQLite 쓰기·다시 읽기 성공'); } catch { setStatus('도구 호출 실패'); } finally { setBusy(false); } }
  return <><section className="probe-panel" aria-label="실제 연결 시험"><main><strong>연결 시험 · UI v0.3</strong><p role="status">{status}</p><p>시험 횟수: <strong>{count ?? '—'}</strong></p><button disabled={!ready || busy} onClick={increment}>{busy ? '저장 중…' : '연결 확인: 시험 횟수 +1'}</button><small>합성 카운터만 저장합니다. 실제 건강 기록이 아닙니다.</small></main></section><DashboardPreview /></>;
}
createRoot(document.getElementById('root')!).render(<Probe />);
