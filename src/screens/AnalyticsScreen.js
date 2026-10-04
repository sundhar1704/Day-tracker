import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, catColor } from '../theme';
import { AppHeader, Card, Ring, SectionTitle } from '../components/UI';
import ReportActions from '../components/ReportActions';
import { useApp } from '../utils/store';
import { summary, buckets, streak, rangeFor, pctOf } from '../utils/stats';
import { fmtShort, parseKey } from '../utils/dates';

const MODES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
const CADENCE = { Daily: 'Last 7 Days', Weekly: 'Last 4 Weeks', Monthly: 'Last 6 Months', Yearly: 'This Year' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export default function AnalyticsScreen({ nav }) {
  const { tasks, cats, profile } = useApp();
  const [mode, setMode] = useState('Weekly');
  const [inc, setInc] = useState({ done: true, cats: true, pending: true });
  const s = summary(tasks, mode);
  const bars = buckets(tasks, mode);
  const max = Math.max(1, ...bars.map((b) => b.total));
  const [a, b] = rangeFor(mode);
  const rangeLabel = mode === 'Daily' ? fmtShort(a) : `${fmtShort(a)} – ${fmtShort(b)}`;
  const st = streak(tasks);
  const perCat = cats.map((c) => { const l = s.list.filter((t) => t.category === c.name); const d = l.filter((t) => t.done).length; return { name: c.name, total: l.length, done: d, pct: pctOf(d, l.length) }; })
    .filter((c) => c.total).sort((x, y) => y.total - x.total);
  const label = s.pct >= 80 ? 'Superb Flow' : s.pct >= 50 ? 'Good Pace' : s.total ? 'Building Up' : 'No data yet';
  const velocity = (() => { const days = mode === 'Daily' ? 1 : Math.max(1, Math.round((b - a) / 86400000) + 1); return (s.done / days).toFixed(1); })();

  const reportText = () => {
    const lines = [`TaskMaster – ${mode} report (${rangeLabel})`, `Completion: ${s.pct}% • Total ${s.total} • Done ${s.done} • Pending ${s.pending} • Overdue ${s.overdue}`];
    if (inc.cats) { lines.push('', 'By category:'); perCat.forEach((c) => lines.push(`- ${c.name}: ${c.done}/${c.total} (${c.pct}%)`)); }
    if (inc.done) { lines.push('', 'Completed:'); s.list.filter((t) => t.done).forEach((t) => lines.push(`✓ ${t.title} (${t.category}, ${t.date})`)); }
    if (inc.pending) { lines.push('', 'Pending:'); s.list.filter((t) => !t.done).forEach((t) => lines.push(`○ ${t.title} (${t.category}, ${t.date} ${t.time})`)); }
    return lines.join('\n');
  };

  const buildHtml = () => {
    const row = (t) => `<tr><td>${esc(t.title)}</td><td>${esc(t.category)}</td><td>${t.date} ${esc(t.time)}</td><td>${t.done ? 'Done' : 'Pending'}</td></tr>`;
    const table = (title, arr) => arr.length ? `<h2>${title}</h2><table><tr><th>Task</th><th>Category</th><th>Due</th><th>Status</th></tr>${arr.map(row).join('')}</table>` : '';
    const html = `<html><body style="font-family:Helvetica;padding:24px;color:#131E17">
      <h1 style="color:#00450D">TaskMaster Productivity Report</h1>
      <p>${esc(profile.name)} • ${mode} • ${rangeLabel}</p>
      <h2>Overview</h2><p>Completion <b>${s.pct}%</b> &nbsp; Total ${s.total} &nbsp; Completed ${s.done} &nbsp; Pending ${s.pending} &nbsp; Overdue ${s.overdue} &nbsp; Streak ${st} day(s)</p>
      ${inc.cats ? `<h2>Category Breakdown</h2><table><tr><th>Category</th><th>Done</th><th>Total</th><th>%</th></tr>${perCat.map((c) => `<tr><td>${esc(c.name)}</td><td>${c.done}</td><td>${c.total}</td><td>${c.pct}%</td></tr>`).join('')}</table>` : ''}
      ${inc.done ? table('Completed Tasks', s.list.filter((t) => t.done)) : ''}
      ${inc.pending ? table('Pending Tasks', s.list.filter((t) => !t.done)) : ''}
      <style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccd;padding:6px;text-align:left;font-size:12px}th{background:#E4F1E5}</style></body></html>`;
    return html;
  };

  const Stat = ({ icon, label: l, value, tint }) => (
    <Card style={{ width: '48%', padding: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: T.sub, letterSpacing: 0.4 }}>{l}</Text>
        <Ionicons name={icon} size={16} color={tint || T.primary} />
      </View>
      <Text style={{ fontSize: 26, fontWeight: '800', color: tint || T.dark, marginTop: 6 }}>{value}</Text>
    </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      <AppHeader sub="Analytics" nav={nav} dot={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', backgroundColor: T.chip, borderRadius: 99, padding: 4 }}>
          {MODES.map((m) => (
            <TouchableOpacity key={m} onPress={() => setMode(m)} style={{ flex: 1, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === m ? T.dark : 'transparent' }}>
              <Text style={{ fontWeight: '700', fontSize: 13, color: mode === m ? '#fff' : T.sub }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: T.deep, letterSpacing: 0.6 }}>PRODUCTIVITY PULSE</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: T.dark, marginTop: 4 }}>Overall Completion</Text>
            <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{rangeLabel}</Text>
            <View style={{ marginTop: 12, gap: 8 }}>
              <View style={{ backgroundColor: T.chip2, borderRadius: 12, padding: 10 }}><Text style={{ fontSize: 10, color: T.sub, fontWeight: '700' }}>PACE</Text><Text style={{ fontWeight: '800', color: T.deep }}>{label}</Text></View>
              <View style={{ backgroundColor: T.chip2, borderRadius: 12, padding: 10 }}><Text style={{ fontSize: 10, color: T.sub, fontWeight: '700' }}>AVG VELOCITY</Text><Text style={{ fontWeight: '800', color: T.deep }}>{velocity} tasks / day</Text></View>
            </View>
          </View>
          <Ring size={112} stroke={10} pct={s.pct}><Text style={{ fontSize: 26, fontWeight: '800', color: T.dark }}>{s.pct}%</Text><Text style={{ fontSize: 10, color: T.muted }}>done</Text></Ring>
        </Card>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 12 }}>
          <Stat icon="list" label="TOTAL TASKS" value={s.total} />
          <Stat icon="checkmark-circle" label="COMPLETED" value={s.done} />
          <Stat icon="hourglass-outline" label="PENDING" value={s.pending} />
          <Stat icon="alert-circle-outline" label="OVERDUE" value={s.overdue} tint={s.overdue ? '#C62828' : undefined} />
        </View>

        <SectionTitle title={`Cadence · ${CADENCE[mode]}`} />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130 }}>
            {bars.map((x, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 130 }}>
                <View style={{ width: mode === 'Yearly' ? 14 : 22, height: Math.max(x.total ? 8 : 4, (x.total / max) * 104), borderRadius: 8, backgroundColor: T.chip, justifyContent: 'flex-end', overflow: 'hidden' }}>
                  <View style={{ height: `${pctOf(x.done, x.total)}%`, backgroundColor: T.primary }} />
                </View>
                <Text style={{ fontSize: 10, color: T.muted, marginTop: 6 }} numberOfLines={1}>{x.label}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
            <Text style={{ fontSize: 11, color: T.sub }}>■ <Text style={{ color: T.primary }}>Completed</Text></Text>
            <Text style={{ fontSize: 11, color: T.sub }}>■ <Text style={{ color: '#B7CDB9' }}>Planned</Text></Text>
          </View>
        </Card>

        <SectionTitle title="Category Performance" />
        <Card style={{ gap: 14 }}>
          {perCat.length ? perCat.map((c) => (
            <View key={c.name}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontWeight: '600', color: T.text }}>{c.name} <Text style={{ color: T.muted, fontSize: 12 }}>({c.done}/{c.total})</Text></Text>
                <Text style={{ fontWeight: '700', color: T.primary }}>{c.pct}%</Text>
              </View>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: T.chip, overflow: 'hidden' }}>
                <View style={{ width: `${c.pct}%`, height: 8, backgroundColor: catColor(c.name).fg }} />
              </View>
            </View>
          )) : <Text style={{ color: T.muted, textAlign: 'center' }}>Create tasks to see category performance.</Text>}
        </Card>

        <View style={{ backgroundColor: T.dark, borderRadius: 22, padding: 18, marginTop: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: T.mint, letterSpacing: 0.6 }}>UNSTOPPABLE MOMENTUM</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 6 }}>{st}-Day Perfect Focus Streak</Text>
          <Text style={{ fontSize: 13, color: '#CDEFD0', marginTop: 4 }}>{st ? 'You completed at least one task each day. Keep it going!' : 'Complete a task today to start your streak.'}</Text>
        </View>

        <SectionTitle title="Productivity Report" />
        <Card>
          <Text style={{ fontSize: 12, color: T.muted }}>Export a shareable summary • {mode} • {rangeLabel}</Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: T.deep, letterSpacing: 0.6, marginTop: 14, marginBottom: 8 }}>INCLUDED IN REPORT</Text>
          {[['done', 'Completed tasks checklist'], ['cats', 'Category breakdown'], ['pending', 'Pending tasks']].map(([k, l]) => (
            <TouchableOpacity key={k} onPress={() => setInc({ ...inc, [k]: !inc[k] })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.chip2, borderRadius: 14, padding: 14, marginBottom: 8 }}>
              <Ionicons name={inc[k] ? 'checkbox' : 'square-outline'} size={22} color={T.primary} />
              <Text style={{ fontWeight: '600', color: T.text }}>{l}</Text>
            </TouchableOpacity>
          ))}
          <ReportActions buildHtml={buildHtml} buildText={reportText} subject={`TaskMaster ${mode} report (${rangeLabel})`} canExport={s.total > 0} emptyMessage="Create some tasks in this period first, then export your report." />
        </Card>
      </ScrollView>
    </View>
  );
}
