import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { T, catColor } from '../theme';
import { PageHeader, Btn } from '../components/UI';
import { useApp } from '../utils/store';
import { dayKey, parseKey, parseTime, fmtTime, fmtLong } from '../utils/dates';

const Label = ({ icon, text, right }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      <Ionicons name={icon} size={14} color={T.deep} />
      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: T.deep }}>{text}</Text>
    </View>
    {right}
  </View>
);

export default function AddTaskScreen({ nav, task, presetDate }) {
  const { cats, addTask, updateTask } = useApp();
  const editing = !!task;
  const init = () => {
    const base = new Date();
    if (task) { const { h, m } = parseTime(task.time); const d = parseKey(task.date); d.setHours(h, m, 0, 0); return d; }
    const d = presetDate ? parseKey(presetDate) : base;
    d.setHours(base.getHours() + 1, 0, 0, 0);
    return d;
  };
  const [title, setTitle] = useState(task?.title || '');
  const [cat, setCat] = useState(task?.category || cats[0]?.name || '');
  const [when, setWhen] = useState(init);
  const [prio, setPrio] = useState(task?.priority || 'Medium');
  const [subs, setSubs] = useState(task?.subtasks || []);
  const [notes, setNotes] = useState(task?.notes || '');
  const [mini, setMini] = useState('');
  const [picker, setPicker] = useState(null);
  const [err, setErr] = useState('');

  const reset = () => { setTitle(''); setCat(cats[0]?.name || ''); setPrio('Medium'); setSubs([]); setNotes(''); setMini(''); setErr(''); };
  const addMini = () => { if (mini.trim()) { setSubs([...subs, { t: mini.trim(), done: false }]); setMini(''); } };

  const save = () => {
    if (!title.trim()) return setErr('Task name is required');
    if (!cat) return Alert.alert('Category needed', 'Create a task category first: Categories tab > options > Task Categories.');
    const data = { title: title.trim(), category: cat, date: dayKey(when), time: fmtTime(when), priority: prio, subtasks: subs, notes: notes.trim() };
    editing ? updateTask(task.id, data) : addTask(data);
    nav.pop();
  };

  const onPick = (e, d) => {
    if (Platform.OS === 'android') setPicker(null);
    if (e.type === 'dismissed' || !d) return;
    const n = new Date(when);
    if (picker === 'date') n.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    else n.setHours(d.getHours(), d.getMinutes(), 0, 0);
    setWhen(n);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Task Detail" onBack={nav.pop} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: T.dark }}>{editing ? 'Edit Task' : 'New Task'}</Text>
            <Text style={{ fontSize: 12, color: T.sub }}>Cultivate your daily flow</Text>
          </View>
          {!editing && (
            <TouchableOpacity onPress={reset} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: T.chip, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 }}>
              <Ionicons name="refresh" size={13} color={T.deep} /><Text style={{ fontSize: 12, fontWeight: '700', color: T.deep }}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 20, marginTop: 14 }}>
          <Label icon="create-outline" text="TASK NAME" right={<Text style={{ fontSize: 12, color: T.muted }}>{title.length}/60</Text>} />
          <TextInput value={title} onChangeText={(v) => { setTitle(v); setErr(''); }} maxLength={60} placeholder="What needs doing?" placeholderTextColor={T.muted}
            style={{ backgroundColor: T.chip2, borderRadius: 16, height: 52, paddingHorizontal: 16, fontSize: 16, color: T.deep, borderWidth: err ? 1 : 0, borderColor: '#D32F2F' }} />
          {!!err && <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 6 }}>{err}</Text>}

          <Label icon="pricetag-outline" text="CATEGORY" right={<Text style={{ fontSize: 12, fontWeight: '700', color: T.primary }}>{cat}</Text>} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {cats.map((c) => (
              <TouchableOpacity key={c.id} onPress={() => setCat(c.name)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 38, borderRadius: 99, backgroundColor: cat === c.name ? T.deep : T.chip2 }}>
                <Ionicons name={c.icon} size={15} color={cat === c.name ? '#fff' : T.sub} />
                <Text style={{ fontWeight: '600', color: cat === c.name ? '#fff' : T.sub }}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label icon="time-outline" text="DATE & TIME" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => setPicker('date')} style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.chip2, borderRadius: 16, padding: 14 }}>
              <Ionicons name="calendar-outline" size={20} color={T.deep} />
              <View><Text style={{ fontSize: 11, color: T.sub, fontWeight: '600' }}>Due Date</Text><Text style={{ fontSize: 14, fontWeight: '700', color: T.deep }}>{when.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text></View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPicker('time')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.chip2, borderRadius: 16, padding: 14 }}>
              <Ionicons name="alarm-outline" size={20} color={T.deep} />
              <View><Text style={{ fontSize: 11, color: T.sub, fontWeight: '600' }}>Time</Text><Text style={{ fontSize: 14, fontWeight: '700', color: T.deep }}>{fmtTime(when)}</Text></View>
            </TouchableOpacity>
          </View>
          {picker && (
            <View>
              <DateTimePicker value={when} mode={picker} display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onPick} />
              {Platform.OS === 'ios' && <Btn title="Done" kind="soft" style={{ height: 42, marginTop: 6 }} onPress={() => setPicker(null)} />}
            </View>
          )}

          <Label icon="flag-outline" text="PRIORITY" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[['Low', T.primary], ['Medium', '#E0A100'], ['High', '#C62828']].map(([p, dot]) => (
              <TouchableOpacity key={p} onPress={() => setPrio(p)}
                style={{ flex: 1, height: 40, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: prio === p ? T.mint : T.chip2, flexDirection: 'row', gap: 6 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} />
                <Text style={{ fontWeight: '700', color: T.deep }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label icon="list-outline" text={`SUBTASKS ( ${subs.length} ADDED )`} right={<View style={{ backgroundColor: T.mint, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 99 }}><Text style={{ fontSize: 10, fontWeight: '700', color: T.deep }}>Step-by-step</Text></View>} />
          {subs.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.chip2, borderRadius: 16, padding: 14, marginBottom: 10, gap: 10 }}>
              <Ionicons name="ellipse-outline" size={18} color={T.primary} />
              <Text style={{ flex: 1, fontSize: 15, color: T.text }}>{s.t}</Text>
              <TouchableOpacity onPress={() => setSubs(subs.filter((_, j) => j !== i))}><Ionicons name="trash-outline" size={18} color={T.muted} /></TouchableOpacity>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput value={mini} onChangeText={setMini} onSubmitEditing={addMini} placeholder="Add a mini step..." placeholderTextColor={T.muted}
              style={{ flex: 1, backgroundColor: T.chip2, borderRadius: 16, height: 48, paddingHorizontal: 14 }} />
            <TouchableOpacity onPress={addMini} style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: T.mint, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="add" size={24} color={T.deep} />
            </TouchableOpacity>
          </View>

          <Label icon="document-text-outline" text="NOTES" />
          <TextInput value={notes} onChangeText={setNotes} multiline placeholder="Anything to remember..." placeholderTextColor={T.muted}
            style={{ backgroundColor: T.chip2, borderRadius: 16, minHeight: 90, padding: 14, textAlignVertical: 'top', fontSize: 15, color: T.text }} />

          <Btn title={editing ? 'Save Changes' : 'Save Task'} icon="checkmark-circle" onPress={save} style={{ marginTop: 24 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
