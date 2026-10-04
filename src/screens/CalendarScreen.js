import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, shadow } from '../theme';
import { AppHeader, Card, Chip, Ring, SectionTitle, Btn, Empty } from '../components/UI';
import TaskCard from '../components/TaskCard';
import { useApp } from '../utils/store';
import { dayKey, parseKey, addDays, startOfWeek, startOfDay, byTime, fmtLong, fmtShort } from '../utils/dates';
import { pctOf } from '../utils/stats';

const Bar = ({ label, pct, left, right }) => (
  <Card style={{ marginBottom: 12 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontWeight: '700', color: T.text, fontSize: 15 }}>{label}</Text>
      <Text style={{ fontWeight: '700', color: T.primary }}>{pct}%</Text>
    </View>
    <View style={{ height: 8, borderRadius: 4, backgroundColor: T.chip, marginVertical: 10, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: 8, backgroundColor: T.dark }} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 12, color: T.muted }}>{left}</Text><Text style={{ fontSize: 12, color: T.deep }}>{right}</Text>
    </View>
  </Card>
);

export default function CalendarScreen({ nav }) {
  const { tasks, toggleTask } = useApp();
  const [sel, setSel] = useState(dayKey());
  const [mode, setMode] = useState('Day');
  const [cursor, setCursor] = useState(startOfDay());
  const selDate = parseKey(sel);
  const dayTasks = (k) => tasks.filter((t) => t.date === k).sort(byTime);
  const list = dayTasks(sel);
  const done = list.filter((t) => t.done).length;
  const pct = pctOf(done, list.length);
  const yKey = dayKey(addDays(selDate, -1));
  const yList = tasks.filter((t) => t.date === yKey);
  const delta = yList.length ? pct - pctOf(yList.filter((t) => t.done).length, yList.length) : null;
  const wStart = startOfWeek(selDate);
  const week = [...Array(7)].map((_, i) => addDays(wStart, i));
  const weekKeys = week.map(dayKey);
  const weekTasks = tasks.filter((t) => weekKeys.includes(t.date));

  // derived "milestones": completion per category this week / this month
  const group = (arr) => {
    const m = {};
    arr.forEach((t) => { (m[t.category] = m[t.category] || { total: 0, done: 0 }); m[t.category].total++; if (t.done) m[t.category].done++; });
    return Object.entries(m).map(([name, v]) => ({ name, ...v, pct: pctOf(v.done, v.total) })).sort((a, b) => b.total - a.total);
  };
  const weekGroups = group(weekTasks).slice(0, 3);
  const monthPrefix = sel.slice(0, 7);
  const monthGroups = group(tasks.filter((t) => t.date.startsWith(monthPrefix))).slice(0, 3);

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const dim = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...[...Array(dim).keys()].map((i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))];
  while (cells.length % 7) cells.push(null);
  const rows = []; for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  const todayKey = dayKey();

  return (
    <View style={{ flex: 1 }}>
      <AppHeader sub="Calendar" nav={nav} dot={tasks.some((t) => !t.done && t.date === todayKey)} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', backgroundColor: T.chip, borderRadius: 99, padding: 4 }}>
          {[['Day', 'today-outline'], ['Week', 'grid-outline'], ['Month', 'calendar-outline']].map(([m, ic]) => (
            <TouchableOpacity key={m} onPress={() => setMode(m)}
              style={{ flex: 1, height: 38, borderRadius: 99, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === m ? T.dark : 'transparent' }}>
              <Ionicons name={ic} size={14} color={mode === m ? '#fff' : T.sub} />
              <Text style={{ fontWeight: '700', color: mode === m ? '#fff' : T.sub }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'Day' && (
          <>
            <Card style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: T.deep }}>⚡ {!list.length ? 'NOTHING PLANNED' : pct >= 80 ? 'HIGH COMPLETION PACE' : pct > 0 ? 'STEADY PACE' : 'READY TO START'}</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: T.dark, marginTop: 6 }}>{fmtLong(selDate)}</Text>
                <Text style={{ color: T.sub, marginTop: 4, fontSize: 13 }}>{done} of {list.length} planned tasks finished</Text>
                {delta !== null && <View style={{ alignSelf: 'flex-start', marginTop: 8 }}><Chip label={`${delta >= 0 ? '+' : ''}${delta}% vs yesterday`} bg={T.mint} fg={T.deep} /></View>}
              </View>
              <Ring size={72} stroke={7} pct={pct}><Text style={{ fontWeight: '800', color: T.dark, fontSize: 16 }}>{pct}%</Text></Ring>
            </Card>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
              <Text style={{ fontWeight: '700', color: T.deep }}>Timeline Window</Text>
              <TouchableOpacity onPress={() => setSel(todayKey)}><Text style={{ fontWeight: '700', color: T.primary, fontSize: 12 }}>{sel === todayKey ? 'Select day' : 'Go to today'}</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }} style={{ flexGrow: 0 }}>
              {week.map((d) => {
                const k = dayKey(d), on = k === sel, n = Math.min(2, dayTasks(k).length);
                return (
                  <TouchableOpacity key={k} onPress={() => setSel(k)}
                    style={{ width: 56, height: 76, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? T.dark : '#fff', ...shadow }}>
                    <Text style={{ fontSize: 12, color: on ? '#fff' : T.sub }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                    <Text style={{ fontSize: 21, fontWeight: '800', color: on ? '#fff' : T.text }}>{d.getDate()}</Text>
                    <View style={{ flexDirection: 'row', gap: 3, marginTop: 4, height: 5 }}>
                      {[...Array(n)].map((_, i) => <View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: on ? '#fff' : T.primary }} />)}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Btn title="Add Schedule Block" icon="add-circle-outline" kind="primary" style={{ marginTop: 16, backgroundColor: T.primary }} onPress={() => nav.push('AddTask', { presetDate: sel })} />

            <SectionTitle title="Day Tasks" right={<Text style={{ fontSize: 12, fontWeight: '700', color: T.primary }}>{sel === todayKey ? `Today, ${fmtShort(selDate)}` : fmtShort(selDate)}</Text>} />
            {list.length ? <View style={{ gap: 12 }}>{list.map((t) => <TaskCard key={t.id} t={t} onToggle={() => toggleTask(t.id)} onPress={() => nav.push('TaskDetail', { id: t.id })} />)}</View>
              : <Card><Empty icon="calendar-outline" title="Nothing scheduled" text="Tap Add Schedule Block to plan this day." /></Card>}
          </>
        )}

        {mode === 'Week' && (
          <View style={{ marginTop: 14, gap: 14 }}>
            {week.map((d) => {
              const k = dayKey(d), l = dayTasks(k);
              return (
                <View key={k}>
                  <TouchableOpacity onPress={() => { setSel(k); setMode('Day'); }} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: '800', color: k === todayKey ? T.primary : T.dark, fontSize: 16 }}>{fmtLong(d)}</Text>
                    <Text style={{ color: T.muted, fontSize: 12 }}>{l.length} task{l.length === 1 ? '' : 's'}</Text>
                  </TouchableOpacity>
                  {l.length ? <View style={{ gap: 10 }}>{l.map((t) => <TaskCard key={t.id} t={t} onToggle={() => toggleTask(t.id)} onPress={() => nav.push('TaskDetail', { id: t.id })} />)}</View>
                    : <Text style={{ color: T.muted, fontSize: 13, marginLeft: 4 }}>No tasks</Text>}
                </View>
              );
            })}
          </View>
        )}

        {mode === 'Month' && (
          <Card style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <TouchableOpacity onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><Ionicons name="chevron-back" size={22} color={T.deep} /></TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '800', color: T.dark }}>{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
              <TouchableOpacity onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><Ionicons name="chevron-forward" size={22} color={T.deep} /></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: T.muted, fontWeight: '700', marginBottom: 6 }}>{d}</Text>)}
            </View>
            {rows.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row' }}>
                {r.map((d, j) => {
                  if (!d) return <View key={j} style={{ flex: 1, height: 46 }} />;
                  const k = dayKey(d), n = dayTasks(k).length, on = k === sel, isToday = k === todayKey;
                  return (
                    <TouchableOpacity key={j} style={{ flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setSel(k); setMode('Day'); }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? T.dark : isToday ? T.chip : 'transparent' }}>
                        <Text style={{ fontWeight: '700', color: on ? '#fff' : T.text }}>{d.getDate()}</Text>
                      </View>
                      <View style={{ width: 5, height: 5, borderRadius: 3, marginTop: 1, backgroundColor: n ? T.primary : 'transparent' }} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </Card>
        )}

        {weekGroups.length > 0 && (
          <>
            <SectionTitle title="Weekly Progress" right={<Chip label={`${fmtShort(wStart)} – ${fmtShort(addDays(wStart, 6))}`} bg={T.mint} fg={T.deep} />} />
            {weekGroups.map((g) => <Bar key={g.name} label={g.name} pct={g.pct} left={`${g.done}/${g.total} tasks completed`} right={g.pct === 100 ? 'Completed' : `${g.total - g.done} remaining`} />)}
          </>
        )}
        {monthGroups.length > 0 && (
          <>
            <SectionTitle title="Monthly Goals & Focus" right={<Chip label={selDate.toLocaleDateString('en-US', { month: 'long' })} bg={T.chip} />} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {monthGroups.map((g) => (
                <Card key={g.name} style={{ flex: 1, alignItems: 'center', padding: 12 }}>
                  <Ring size={56} stroke={5} pct={g.pct}><Text style={{ fontSize: 12, fontWeight: '800', color: T.deep }}>{g.pct}%</Text></Ring>
                  <Text numberOfLines={1} style={{ fontWeight: '700', marginTop: 8, color: T.text, fontSize: 13 }}>{g.name}</Text>
                  <Text style={{ fontSize: 11, color: T.muted }}>{g.done} / {g.total} tasks</Text>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
