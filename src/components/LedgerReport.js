import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme';
import { Sheet } from './UI';
import ReportActions from './ReportActions';
import { fmt } from '../utils/money';
import { sumOf, balanceAsOf, newestFirst, dateLabel } from '../utils/ledger';
import { dayKey, addDays, startOfWeek, parseKey } from '../utils/dates';

const PERIODS = ['Today', 'This Week', 'This Month', 'All Time'];
const TYPES = [['All', 'All Entries'], ['CR', 'Income (CR)'], ['DR', 'Expenses (DR)']];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function periodRange(p) {
  const now = new Date(), today = dayKey(now);
  if (p === 'Today') return [today, today];
  if (p === 'This Week') return [dayKey(startOfWeek(now)), dayKey(addDays(startOfWeek(now), 6))];
  if (p === 'This Month') return [dayKey(new Date(now.getFullYear(), now.getMonth(), 1)), dayKey(new Date(now.getFullYear(), now.getMonth() + 1, 0))];
  return ['0000-01-01', '9999-12-31'];
}

export default function LedgerReport({ visible, onClose, ledger }) {
  const cur = ledger.currency;
  const allNames = useMemo(() => [...new Set(ledger.cats.map((c) => c.name))], [ledger.cats]);
  const [chosen, setChosen] = useState(null); // null = all categories
  const [type, setType] = useState('All');
  const [period, setPeriod] = useState('This Month');
  const sel = chosen || allNames;
  const [from, to] = periodRange(period);
  const list = ledger.txns.filter((t) => t.date >= from && t.date <= to && sel.includes(t.category) && (type === 'All' || t.type === type)).sort(newestFirst);
  const credit = sumOf(list, 'CR'), debit = sumOf(list, 'DR');
  const toggle = (n) => setChosen(sel.includes(n) ? sel.filter((x) => x !== n) : [...sel, n]);
  const startBal = (ledger.opening || 0) + sumOf(ledger.txns.filter((t) => t.date < from), 'CR') - sumOf(ledger.txns.filter((t) => t.date < from), 'DR');
  const endKey = to > dayKey() ? dayKey() : to;
  const endBal = balanceAsOf(ledger, endKey);
  const title = `TaskMaster Ledger Report – ${period}`;

  const perCat = sel.map((n) => { const l = list.filter((t) => t.category === n); return { n, cr: sumOf(l, 'CR'), dr: sumOf(l, 'DR'), c: l.length }; }).filter((x) => x.c);

  const text = () => [
    title, `Categories: ${chosen ? sel.join(', ') : 'All'}`, `Opening balance: ${fmt(startBal, cur)}`,
    `Total credit: ${fmt(credit, cur)} • Total debit: ${fmt(debit, cur)}`, `Closing balance: ${fmt(endBal, cur)}`, '',
    ...list.map((t) => `${t.date} ${t.time} | ${t.type} | ${t.category} | ${t.desc} | ${fmt(t.type === 'CR' ? t.amount : -t.amount, cur, true)}`),
  ].join('\n');

  const buildHtml = () => {
    const days = [...new Set(list.map((t) => t.date))];
    const rows = days.map((d) => {
      const items = list.filter((t) => t.date === d);
      return `<h3>${dateLabel(d)} <span style="font-weight:normal;color:#555">— Day close ${fmt(balanceAsOf(ledger, d), cur)}</span></h3>
      <table><tr><th>Time</th><th>Description</th><th>Category</th><th>Method</th><th>Ref</th><th style="text-align:right">Amount</th></tr>
      ${items.map((t) => `<tr><td>${esc(t.time)}</td><td>${esc(t.desc)}</td><td>${esc(t.category)}</td><td>${esc(t.method || '')}</td><td>${esc(t.ref || '')}</td>
      <td style="text-align:right;color:${t.type === 'CR' ? '#126D27' : '#B71C1C'}">${fmt(t.type === 'CR' ? t.amount : -t.amount, cur, true)} ${t.type}</td></tr>`).join('')}</table>`;
    }).join('');
    const html = `<html><body style="font-family:Helvetica;padding:24px;color:#131E17">
      <h1 style="color:#00450D">${esc(title)}</h1>
      <p>Categories: <b>${chosen ? esc(sel.join(', ')) : 'All'}</b> • ${TYPES.find((x) => x[0] === type)[1]}</p>
      <table class="s"><tr><td>Opening balance<br><b>${fmt(startBal, cur)}</b></td><td>Total credit<br><b style="color:#126D27">${fmt(credit, cur)}</b></td>
      <td>Total debit<br><b style="color:#B71C1C">${fmt(debit, cur)}</b></td><td>Closing balance<br><b>${fmt(endBal, cur)}</b></td></tr></table>
      <h2>By category</h2><table><tr><th>Category</th><th>Entries</th><th>Credit</th><th>Debit</th></tr>
      ${perCat.map((x) => `<tr><td>${esc(x.n)}</td><td>${x.c}</td><td>${fmt(x.cr, cur)}</td><td>${fmt(x.dr, cur)}</td></tr>`).join('')}</table>
      <h2>Entries</h2>${rows}
      <style>table{width:100%;border-collapse:collapse;margin-bottom:8px}td,th{border:1px solid #ccd;padding:6px;text-align:left;font-size:12px}th{background:#E4F1E5}.s td{font-size:13px}</style></body></html>`;
    return html;
  };

  const Pill = ({ on, label, onPress }) => (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 14, height: 38, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? T.deep : T.chip2 }}>
      <Text style={{ fontWeight: '700', fontSize: 13, color: on ? '#fff' : T.sub }}>{label}</Text>
    </TouchableOpacity>
  );
  const H = ({ children, right }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 10 }}>
      <Text style={{ fontSize: 12, fontWeight: '800', color: T.deep, letterSpacing: 0.8 }}>{children}</Text>{right}
    </View>
  );

  return (
    <Sheet visible={visible} onClose={onClose} title="Download Report">
      <H right={<View style={{ flexDirection: 'row', gap: 14 }}>
        <TouchableOpacity onPress={() => setChosen(null)}><Text style={{ color: T.primary, fontWeight: '700', fontSize: 12 }}>Select all</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setChosen([])}><Text style={{ color: T.muted, fontWeight: '700', fontSize: 12 }}>Clear</Text></TouchableOpacity></View>}>CATEGORIES</H>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {allNames.map((n) => <Pill key={n} on={sel.includes(n)} label={n} onPress={() => toggle(n)} />)}
      </View>
      <H>ENTRY TYPE</H>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{TYPES.map(([k, l]) => <Pill key={k} on={type === k} label={l} onPress={() => setType(k)} />)}</View>
      <H>PERIOD</H>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{PERIODS.map((p) => <Pill key={p} on={period === p} label={p} onPress={() => setPeriod(p)} />)}</View>

      <View style={{ backgroundColor: T.chip2, borderRadius: 16, padding: 14, marginTop: 18 }}>
        <Text style={{ fontWeight: '800', color: T.dark }}>{list.length} entr{list.length === 1 ? 'y' : 'ies'} selected</Text>
        <Text style={{ color: T.sub, fontSize: 12, marginTop: 4 }}>Credit {fmt(credit, cur)} • Debit {fmt(debit, cur)} • Closing {fmt(endBal, cur)}</Text>
      </View>
      <ReportActions buildHtml={buildHtml} buildText={text} subject={title} canExport={sel.length > 0 && list.length > 0} emptyMessage={sel.length ? 'There are no entries for this selection.' : 'Select at least one category for the report.'} />
    </Sheet>
  );
}
