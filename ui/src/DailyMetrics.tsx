import type { CSSProperties } from 'react';

export function DailyMetrics({longest,current,done,total}:{longest:number;current:number;done:number;total:number}) {
 return <section className="daily-metrics" aria-label="기록과 달성">
  <div className="streaks"><p>최다 연속 기록<strong>{longest}<small> 일</small></strong></p><p>현재 연속 기록<strong>{current}<small> 일</small></strong></p></div>
  <div className="completion"><div className="completion-ring" role="img" aria-label={`오늘 목표 ${total}개 중 ${done}개 준수`} style={{'--completion':`${total ? done/total*360 : 0}deg`} as CSSProperties}><strong>{done}<small>/{total}</small></strong></div><span>오늘 목표 달성</span></div>
 </section>;
}
