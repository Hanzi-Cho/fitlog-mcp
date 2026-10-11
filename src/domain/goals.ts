export const dailyGoalSlots = ['workout', 'breakfast', 'lunch', 'dinner'] as const;
type GoalCheck = {localDate:string;slot:string;status:string;occurrence:string;controlType?:string;count?:number;target?:number};

// Goal attainment is independent of activity/photo counts and filter selection.
export function goalProgress(checks: GoalCheck[], today: string, slots: readonly string[] = dailyGoalSlots) {
  const dates = [...new Set(checks.filter(c => c.localDate <= today).map(c => c.localDate))].sort();
  return { total: slots.length, days: dates.map(date => {
    const completed = new Set(checks.filter(c => c.localDate === date && slots.includes(c.slot) && (c.controlType==='count' ? (c.count??0)>=(c.target??1) : c.status==='yes') && c.occurrence !== 'planned').map(c => c.slot)).size;
    const ratio = slots.length ? completed / slots.length : 0;
    return { date, completed, total:slots.length, ratio, level:completed === 0 ? 0 : completed === slots.length ? 4 : Math.min(3, Math.ceil(ratio * 3)) };
  }) };
}

export function checkedRecordDates(checks: GoalCheck[], today:string) {
  return [...new Set(checks.filter(c => c.localDate <= today && (c.status !== 'unwritten' || c.occurrence === 'completed' || c.occurrence === 'skipped')).map(c => c.localDate))];
}
