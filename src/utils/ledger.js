import { dayKey, addDays, parseKey, timeMinutes } from './dates';

export const sumOf = (arr, type) => arr.filter((t) => t.type === type).reduce((a, t) => a + t.amount, 0);
export const balanceAsOf = (ledger, key) => {
  const l = ledger.txns.filter((t) => t.date <= key);
  return (ledger.opening || 0) + sumOf(l, 'CR') - sumOf(l, 'DR');
};
export const newestFirst = (a, b) => (a.date === b.date ? timeMinutes(b) - timeMinutes(a) : a.date < b.date ? 1 : -1);

export const dayLabel = (key) => {
  const today = dayKey();
  if (key === today) return 'Today';
  if (key === dayKey(addDays(parseKey(today), -1))) return 'Yesterday';
  return parseKey(key).toLocaleDateString('en-US', { weekday: 'long' });
};
export const dateLabel = (key) => parseKey(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const ICONS = {}; // category name -> icon, filled from ledger.cats at runtime
export const iconFor = (ledger, name) => ledger.cats.find((c) => c.name === name)?.icon || 'pricetag-outline';

// Each money account (a category with account:true) has its own opening balance and entries.
// scoped() returns a ledger view for ONE account so all the helpers above keep working.
export const scoped = (ledger, acc) => ({
  ...ledger,
  txns: ledger.txns.filter((t) => t.account === acc),
  opening: ledger.openings?.[acc] ?? 0,
});
