import { dayKey, addDays, startOfDay, startOfWeek } from './dates';

export const pctOf = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export function streak(tasks) {
  const days = new Set(tasks.filter((t) => t.done && t.doneAt).map((t) => dayKey(new Date(t.doneAt))));
  let d = new Date();
  if (!days.has(dayKey(d))) d = addDays(d, -1);
  let n = 0;
  while (days.has(dayKey(d))) { n++; d = addDays(d, -1); }
  return n;
}

export function rangeFor(mode) {
  const today = startOfDay();
  const y = today.getFullYear(), m = today.getMonth();
  if (mode === 'Daily') return [today, today];
  if (mode === 'Weekly') return [startOfWeek(today), addDays(startOfWeek(today), 6)];
  if (mode === 'Monthly') return [new Date(y, m, 1), new Date(y, m + 1, 0)];
  return [new Date(y, 0, 1), new Date(y, 11, 31)];
}

export const inRange = (t, [a, b]) => t.date >= dayKey(a) && t.date <= dayKey(b);

export function summary(tasks, mode) {
  const r = rangeFor(mode);
  const list = tasks.filter((t) => inRange(t, r));
  const today = dayKey();
  const done = list.filter((t) => t.done).length;
  return {
    list, total: list.length, done,
    pending: list.filter((t) => !t.done && t.date >= today).length,
    overdue: list.filter((t) => !t.done && t.date < today).length,
    pct: pctOf(done, list.length),
  };
}

export function buckets(tasks, mode) {
  const today = startOfDay();
  const count = (a, b) => { const l = tasks.filter((t) => t.date >= dayKey(a) && t.date <= dayKey(b)); return { total: l.length, done: l.filter((t) => t.done).length }; };
  const out = [];
  if (mode === 'Daily') {
    for (let i = 6; i >= 0; i--) { const d = addDays(today, -i); out.push({ label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), ...count(d, d) }); }
  } else if (mode === 'Weekly') {
    const labels = ['3w ago', '2w ago', 'Last wk', 'This wk'];
    for (let i = 3; i >= 0; i--) { const s = addDays(startOfWeek(today), -7 * i); out.push({ label: labels[3 - i], ...count(s, addDays(s, 6)) }); }
  } else if (mode === 'Monthly') {
    for (let i = 5; i >= 0; i--) {
      const s = new Date(today.getFullYear(), today.getMonth() - i, 1), e = new Date(s.getFullYear(), s.getMonth() + 1, 0);
      out.push({ label: s.toLocaleDateString('en-US', { month: 'short' }), ...count(s, e) });
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const s = new Date(today.getFullYear(), i, 1), e = new Date(today.getFullYear(), i + 1, 0);
      out.push({ label: s.toLocaleDateString('en-US', { month: 'narrow' }), ...count(s, e) });
    }
  }
  return out;
}
