import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, shadow, catColor } from '../theme';
import { Chip } from './UI';
import { parseKey, fmtShort } from '../utils/dates';

const PRIO = { High: ['#FFDAD6', '#93000A'], Medium: ['#FFF1D6', '#8A5A00'], Low: ['#E4F1E5', '#1B5E20'] };

export default function TaskCard({ t, onToggle, onPress, showDate, late }) {
  const c = catColor(t.category);
  const [pb, pf] = PRIO[t.priority] || PRIO.Medium;
  const subs = t.subtasks?.length || 0;
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}
      style={{ backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', gap: 14, borderLeftWidth: late ? 4 : 0, borderLeftColor: '#C62828', ...shadow }}>
      <TouchableOpacity onPress={onToggle} hitSlop={10}
        style={{ width: 26, height: 26, borderRadius: 13, marginTop: 1, backgroundColor: t.done ? T.primary : T.chip, alignItems: 'center', justifyContent: 'center' }}>
        {t.done && <Ionicons name="checkmark" size={16} color="#fff" />}
      </TouchableOpacity>
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: t.done ? T.muted : T.text, textDecorationLine: t.done ? 'line-through' : 'none' }}>{t.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <Chip label={t.category} bg={c.bg} fg={c.fg} />
          {late && <Chip label="Overdue" bg="#FFDAD6" fg="#93000A" icon="alert-circle" />}
          <Chip label={t.priority} bg={pb} fg={pf} />
          {subs > 0 && <Chip label={`${t.subtasks.filter((s) => s.done).length}/${subs}`} bg={T.chip} icon="list" />}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="time-outline" size={13} color={T.muted} />
          <Text style={{ fontSize: 12, color: T.muted }}>{showDate ? `${fmtShort(parseKey(t.date))} · ` : ''}{t.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
