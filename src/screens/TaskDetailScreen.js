import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Share, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { T, catColor } from '../theme';
import { PageHeader, IconBtn, Card, Chip, Btn } from '../components/UI';
import { useApp } from '../utils/store';
import { parseKey, dayKey, fmtLong } from '../utils/dates';
import { pctOf } from '../utils/stats';

export default function TaskDetailScreen({ nav, id }) {
  const { tasks, toggleTask, updateTask, deleteTask } = useApp();
  const t = tasks.find((x) => x.id === id);
  const [notes, setNotes] = useState(t?.notes || '');
  const [mini, setMini] = useState('');
  const [picker, setPicker] = useState(false);
  useEffect(() => { if (!t) nav.pop(); }, [t]);
  if (!t) return null;

  const c = catColor(t.category);
  const subs = t.subtasks || [];
  const doneSubs = subs.filter((s) => s.done).length;
  const pct = t.done ? 100 : pctOf(doneSubs, subs.length);
  const toggleSub = (i) => updateTask(t.id, { subtasks: subs.map((s, j) => (j === i ? { ...s, done: !s.done } : s)) });
  const addSub = () => { if (mini.trim()) { updateTask(t.id, { subtasks: [...subs, { t: mini.trim(), done: false }] }); setMini(''); } };
  const remove = () => Alert.alert('Delete task?', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteTask(t.id); } }]);
  const share = () => Share.share({ message: `${t.title}\n${subs.map((s) => `${s.done ? '☑' : '☐'} ${s.t}`).join('\n')}` });
  const reschedule = (e, d) => {
    if (Platform.OS === 'android') setPicker(false);
    if (e.type === 'dismissed' || !d) return;
    updateTask(t.id, { date: dayKey(d) });
  };

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Task Detail" onBack={nav.pop} right={[<IconBtn key="e" name="create-outline" onPress={() => nav.push('AddTask', { task: t })} />, <IconBtn key="d" name="trash-outline" color="#C62828" onPress={remove} />]} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={t.category} bg={c.bg} fg={c.fg} />
          <Chip label={`${fmtLong(parseKey(t.date))}, ${t.time}`} bg={T.chip} icon="time-outline" />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: T.dark, marginTop: 12, textDecorationLine: t.done ? 'line-through' : 'none' }}>{t.title}</Text>
        <Text style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Priority: {t.priority}</Text>

        <Card style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '700', color: T.deep }}>Progress</Text>
            <Text style={{ fontWeight: '700', color: T.primary }}>{subs.length ? `${doneSubs} of ${subs.length} completed • ${pct}%` : t.done ? 'Completed' : 'Not started'}</Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: T.chip2, marginTop: 10, overflow: 'hidden' }}>
            <View style={{ width: `${pct}%`, height: 8, backgroundColor: T.primary }} />
          </View>
        </Card>

        <Text style={{ fontSize: 18, fontWeight: '700', color: T.dark, marginTop: 22, marginBottom: 10 }}>Subtasks</Text>
        <View style={{ gap: 10 }}>
          {subs.map((s, i) => (
            <TouchableOpacity key={i} onPress={() => toggleSub(i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14 }}>
              <Ionicons name={s.done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={T.primary} />
              <Text style={{ flex: 1, fontSize: 15, color: s.done ? T.muted : T.text, textDecorationLine: s.done ? 'line-through' : 'none' }}>{s.t}</Text>
              <TouchableOpacity hitSlop={10} onPress={() => updateTask(t.id, { subtasks: subs.filter((_, j) => j !== i) })}><Ionicons name="close" size={18} color={T.muted} /></TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput value={mini} onChangeText={setMini} onSubmitEditing={addSub} placeholder="Add new item..." placeholderTextColor={T.muted}
              style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, height: 48, paddingHorizontal: 14 }} />
            <TouchableOpacity onPress={addSub} style={{ paddingHorizontal: 20, height: 48, borderRadius: 16, backgroundColor: T.deep, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: T.dark, marginTop: 22, marginBottom: 10 }}>Notes</Text>
        <TextInput value={notes} onChangeText={setNotes} onBlur={() => updateTask(t.id, { notes })} multiline placeholder="Add notes..." placeholderTextColor={T.muted}
          style={{ backgroundColor: '#fff', borderRadius: 16, minHeight: 100, padding: 14, textAlignVertical: 'top', fontSize: 15, color: T.text }} />

        <Btn title={t.done ? 'Mark as Incomplete' : 'Mark Task Complete'} icon="checkmark-circle" style={{ marginTop: 24 }} onPress={() => toggleTask(t.id)} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Btn title="Reschedule" kind="soft" icon="calendar-outline" style={{ flex: 1 }} onPress={() => setPicker(true)} />
          <Btn title="Share List" kind="soft" icon="share-social-outline" style={{ flex: 1 }} onPress={share} />
        </View>
        {picker && <DateTimePicker value={parseKey(t.date)} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={reschedule} />}
      </ScrollView>
    </View>
  );
}
