import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, catColor } from '../theme';
import { AppHeader, Card, Chip, Ring, SectionTitle, Empty } from '../components/UI';
import { useApp } from '../utils/store';
import { dayKey, startOfWeek, addDays, fmtTime, fmtShort } from '../utils/dates';
import { streak, pctOf } from '../utils/stats';

export default function CompletedScreen({ nav }) {
  const { tasks, toggleTask, deleteTask, clearCompleted } = useApp();
  const done = tasks.filter((t) => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const ws = dayKey(startOfWeek(new Date())), we = dayKey(addDays(startOfWeek(new Date()), 6));
  const weekAll = tasks.filter((t) => t.date >= ws && t.date <= we);
  const weekDone = weekAll.filter((t) => t.done).length;
  const pct = pctOf(weekDone, weekAll.length);
  const st = streak(tasks);
  const when = (t) => {
    if (!t.doneAt) return 'Completed';
    const d = new Date(t.doneAt);
    return dayKey(d) === dayKey() ? `Completed today at ${fmtTime(d)}` : `Completed ${fmtShort(d)} at ${fmtTime(d)}`;
  };
  const clear = () => Alert.alert('Clear all completed?', `This permanently removes ${done.length} completed task${done.length === 1 ? '' : 's'}.`, [
    { text: 'Cancel', style: 'cancel' }, { text: 'Clear All', style: 'destructive', onPress: clearCompleted }]);

  return (
    <View style={{ flex: 1 }}>
      <AppHeader sub="Completed" nav={nav} dot={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: T.deep, letterSpacing: 0.6 }}>WEEKLY MOMENTUM</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: T.dark, marginTop: 4 }}>{weekDone} task{weekDone === 1 ? '' : 's'} 🎉</Text>
            <Text style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{weekAll.length ? 'Finished this week.' : 'Nothing planned this week yet.'}</Text>
            <Text style={{ fontSize: 12, color: T.primary, fontWeight: '700', marginTop: 8 }}>● {st}-day streak maintained</Text>
          </View>
          <Ring size={76} stroke={7} pct={pct}><Text style={{ fontWeight: '800', color: T.dark }}>{pct}%</Text></Ring>
        </Card>

        <SectionTitle title="Archive" right={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Chip label={`${done.length} item${done.length === 1 ? '' : 's'}`} bg={T.mint} fg={T.deep} />
          {done.length > 0 && <TouchableOpacity onPress={clear}><Text style={{ color: '#C62828', fontWeight: '700', fontSize: 13 }}>Clear All</Text></TouchableOpacity>}
        </View>} />

        {done.length ? (
          <View style={{ gap: 10 }}>
            {done.map((t) => {
              const c = catColor(t.category);
              return (
                <TouchableOpacity key={t.id} activeOpacity={0.9} onPress={() => nav.push('TaskDetail', { id: t.id })}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 18, padding: 14 }}>
                  <Ionicons name="checkmark-circle" size={26} color={T.primary} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: T.muted, textDecorationLine: 'line-through' }}>{t.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Chip label={t.category} bg={c.bg} fg={c.fg} />
                      <Text style={{ fontSize: 11, color: T.muted }}>{when(t)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity hitSlop={8} onPress={() => toggleTask(t.id)}><Ionicons name="arrow-undo-outline" size={20} color={T.deep} /></TouchableOpacity>
                  <TouchableOpacity hitSlop={8} onPress={() => deleteTask(t.id)}><Ionicons name="trash-outline" size={19} color={T.muted} /></TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Card><Empty icon="checkmark-done-outline" title="Nothing completed yet" text="Tasks you check off on the Today page will show up here." /></Card>
        )}
      </ScrollView>
    </View>
  );
}
