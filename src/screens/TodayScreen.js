import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, shadow } from '../theme';
import { AppHeader, Card, Empty, Ring, Btn } from '../components/UI';
import TaskCard from '../components/TaskCard';
import { useApp } from '../utils/store';
import { dayKey, byTime, dueDate } from '../utils/dates';
import { pctOf } from '../utils/stats';

export default function TodayScreen({ nav }) {
  const { tasks, cats, profile, toggleTask } = useApp();
  const [filter, setFilter] = useState('All');
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const key = dayKey();
  const now = new Date();

  const todays = tasks.filter((t) => t.date === key).sort(byTime);
  // unfinished tasks from earlier days stay here as reminders until they are completed
  const overdue = tasks.filter((t) => !t.done && t.date < key).sort((a, b) => (a.date === b.date ? byTime(a, b) : a.date < b.date ? -1 : 1));
  const all = [...overdue, ...todays];
  const done = all.filter((t) => t.done).length;
  const left = all.length - done;
  const pct = pctOf(done, all.length);
  const match = (t) => (filter === 'All' || t.category === filter) && t.title.toLowerCase().includes(q.toLowerCase());
  const shownOverdue = overdue.filter(match);
  const shownToday = todays.filter(match);
  const hr = now.getHours();
  const first = (profile.name || '').split(' ')[0].toUpperCase();
  const note = !all.length ? 'Add your first task to get started.' : pct === 100 ? 'All done for today. Great work!'
    : overdue.length ? `${overdue.length} reminder${overdue.length === 1 ? '' : 's'} from earlier days need attention.`
    : pct >= 50 ? `Steady pace! ${left} task${left === 1 ? '' : 's'} close to completion.` : `${left} task${left === 1 ? '' : 's'} waiting for you.`;
  const isLate = (t) => !t.done && dueDate(t) < now;

  return (
    <View style={{ flex: 1 }}>
      <AppHeader badge="Today" nav={nav} dot={left > 0} onSearch={() => { setSearching(!searching); setQ(''); }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {searching && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, height: 46, marginBottom: 12, gap: 8, ...shadow }}>
            <Ionicons name="search" size={18} color={T.muted} />
            <TextInput autoFocus value={q} onChangeText={setQ} placeholder="Search tasks..." placeholderTextColor={T.muted} style={{ flex: 1, fontSize: 15 }} />
          </View>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: T.mint, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="leaf-outline" size={15} color={T.primary} />
            </View>
            <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: T.primary, flex: 1 }}>
              {hr < 12 ? 'GOOD MORNING' : hr < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING'}{first ? `, ${first}` : ''}
            </Text>
          </View>
          <View style={{ backgroundColor: T.chip, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: T.deep }}>● {done} of {all.length} done</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: T.dark }}>Today's Focus</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: T.muted }}>{now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
        </View>
        <Text style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {left} task{left === 1 ? '' : 's'} pending</Text>

        <Card style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: T.deep }}>Mindful Progress</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: T.primary }}>{done}/{all.length} tasks</Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: T.chip2, overflow: 'hidden' }}>
              <View style={{ width: `${pct}%`, height: 8, backgroundColor: T.primary }} />
            </View>
            <Text style={{ fontSize: 12, color: T.muted }}>{note}</Text>
          </View>
          <Ring size={64} stroke={6} pct={pct}><Text style={{ fontSize: 15, fontWeight: '800', color: T.dark }}>{pct}%</Text></Ring>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16, flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
          {['All', ...cats.map((c) => c.name)].map((c) => {
            const on = filter === c;
            const n = c === 'All' ? all.length : all.filter((t) => t.category === c).length;
            return (
              <TouchableOpacity key={c} onPress={() => setFilter(c)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 40, borderRadius: 99, backgroundColor: on ? T.deep : T.chip }}>
                {c === 'All' ? <Ionicons name="filter" size={14} color={on ? '#fff' : T.sub} /> : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: on ? '#fff' : T.deep }} />}
                <Text style={{ fontSize: 14, fontWeight: '700', color: on ? '#fff' : T.sub }}>{c === 'All' ? `All (${n})` : n ? `${c} (${n})` : c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {shownOverdue.length > 0 && (
          <View style={{ marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFE9E6', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 }}>
              <Ionicons name="alarm" size={18} color="#B71C1C" />
              <Text style={{ flex: 1, fontWeight: '800', color: '#B71C1C', fontSize: 13 }}>Reminders · not finished on earlier days ({shownOverdue.length})</Text>
            </View>
            <View style={{ gap: 12 }}>
              {shownOverdue.map((t) => <TaskCard key={t.id} t={t} late showDate onToggle={() => toggleTask(t.id)} onPress={() => nav.push('TaskDetail', { id: t.id })} />)}
            </View>
          </View>
        )}

        {shownToday.length > 0 && (
          <View style={{ gap: 12 }}>
            {shownOverdue.length > 0 && <Text style={{ fontSize: 14, fontWeight: '800', color: T.deep, letterSpacing: 0.6 }}>TODAY</Text>}
            {shownToday.map((t) => <TaskCard key={t.id} t={t} late={isLate(t)} onToggle={() => toggleTask(t.id)} onPress={() => nav.push('TaskDetail', { id: t.id })} />)}
          </View>
        )}

        {!shownOverdue.length && !shownToday.length && (
          <Card>
            <Empty title={all.length ? 'No matching tasks' : 'No tasks for today'} text={all.length ? 'Try another category or search.' : 'Plan your day by adding your first task.'}>
              {!all.length && <Btn title="Add Task" icon="add" style={{ marginTop: 18, paddingHorizontal: 28 }} onPress={() => nav.push('AddTask')} />}
            </Empty>
          </Card>
        )}

        <View style={{ backgroundColor: '#E8F5E9', borderRadius: 18, padding: 16, marginTop: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: T.deep }}>🌱 MINDFUL THOUGHT</Text>
          <Text style={{ fontSize: 15, fontStyle: 'italic', color: T.text, marginTop: 8, lineHeight: 22 }}>“Small daily efforts, like watering a sprout, blossom into grand achievements.”</Text>
        </View>
      </ScrollView>
    </View>
  );
}
