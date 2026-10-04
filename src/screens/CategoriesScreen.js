import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T, CAT_ICONS, catColor } from '../theme';
import { AppHeader, PageHeader, Card, Btn, Empty, Toggle } from '../components/UI';
import { fmt } from '../utils/money';
import { balanceAsOf, scoped } from '../utils/ledger';
import { dayKey } from '../utils/dates';
import { useApp } from '../utils/store';

export default function CategoriesScreen({ nav, pushed }) {
  const { cats, tasks, ledger, addCategory, updateCategory, deleteCategory } = useApp();
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null); // null | {id?}
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState(CAT_ICONS[0]);
  const [err, setErr] = useState('');
  const [isAcc, setIsAcc] = useState(false);

  const active = (n) => tasks.filter((t) => t.category === n && !t.done).length;
  const total = tasks.filter((t) => !t.done).length;
  const most = cats.map((c) => ({ ...c, n: active(c.name) })).sort((a, b) => b.n - a.n)[0];
  const shown = cats.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  const entriesOf = (id) => ledger.txns.filter((t) => t.account === id).length;
  const balanceOf = (id) => balanceAsOf(scoped(ledger, id), dayKey());
  const open = (c) => { setIsAcc(!!c?.account); setErr(''); setName(c?.name || ''); setDesc(c?.desc || ''); setIcon(c?.icon || CAT_ICONS[0]); setModal({ id: c?.id }); };
  const save = () => {
    const e = modal.id ? updateCategory(modal.id, { name, icon, desc, account: isAcc }) : addCategory({ name, icon, desc, account: isAcc });
    if (e) return setErr(e);
    setModal(null);
  };
  const remove = () => Alert.alert('Delete category?', cats.find((c) => c.id === modal.id)?.account ? 'This also deletes all of its money entries and its balance. Tasks keep their label.' : 'Existing tasks keep their label, but this category will be removed from the list.', [
    { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteCategory(modal.id); setModal(null); } }]);

  return (
    <View style={{ flex: 1 }}>
      {pushed ? <PageHeader title="Task Categories" onBack={nav.pop} /> : <AppHeader sub="Categories" nav={nav} dot={false} />}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 30, fontWeight: '800', color: T.dark }}>Categories</Text>
        <Text style={{ fontSize: 13, color: T.primary, fontWeight: '600', marginTop: 2 }}>● {cats.length} active categories</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 14, height: 48, marginTop: 14, gap: 8 }}>
          <Ionicons name="search" size={18} color={T.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search categories or tasks..." placeholderTextColor={T.muted} style={{ flex: 1, fontSize: 15 }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
          <Card style={{ flex: 1, padding: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: T.sub, letterSpacing: 0.5 }}>TOTAL TASKS</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: T.dark, marginTop: 4 }}>{total} Active</Text>
          </Card>
          <Card style={{ flex: 1, padding: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: T.sub, letterSpacing: 0.5 }}>MOST ACTIVE</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: T.dark, marginTop: 4 }}>{most && most.n ? `${most.name} (${most.n})` : '—'}</Text>
          </Card>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: T.dark, letterSpacing: 0.5 }}>All Folders</Text>
          <Text style={{ fontSize: 12, color: T.muted }}>Tap an account to open its balance</Text>
        </View>
        <View style={{ gap: 10 }}>
          {shown.map((c) => {
            const col = catColor(c.name), n = active(c.name);
            return (
              <TouchableOpacity key={c.id} onPress={() => (c.account ? nav.push('Ledger', { id: c.id }) : open(c))} activeOpacity={0.9} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 18, padding: 14 }}>
                <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: col.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={c.icon} size={22} color={col.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: T.text }}>{c.name}</Text>
                    {c.account && <View style={{ backgroundColor: T.mint, paddingHorizontal: 8, paddingVertical: 1, borderRadius: 6 }}><Text style={{ fontSize: 9, fontWeight: '800', color: T.deep }}>ACCOUNT</Text></View>}
                  </View>
                  <Text numberOfLines={1} style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {c.account ? `Balance ${fmt(balanceOf(c.id), ledger.currency)} • ${entriesOf(c.id)} entr${entriesOf(c.id) === 1 ? 'y' : 'ies'}` : `${n} active task${n === 1 ? '' : 's'}${c.desc ? ` • ${c.desc}` : ''}`}
                  </Text>
                </View>
                <TouchableOpacity hitSlop={12} onPress={() => open(c)}><Ionicons name="create-outline" size={19} color={T.muted} /></TouchableOpacity>
                {c.account && <Ionicons name="chevron-forward" size={18} color={T.primary} />}
              </TouchableOpacity>
            );
          })}
          {!shown.length && <Card><Empty icon="folder-open-outline" title="No categories found" /></Card>}
        </View>

        <Btn title="Add Category" icon="add" style={{ marginTop: 20 }} onPress={() => open(null)} />
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 28 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: T.dark }}>{modal?.id ? 'Edit Category' : 'New Category'}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: T.deep, letterSpacing: 0.8, marginTop: 16, marginBottom: 8 }}>NAME</Text>
            <TextInput value={name} onChangeText={(v) => { setName(v); setErr(''); }} maxLength={20} placeholder="e.g. Fitness" placeholderTextColor={T.muted}
              style={{ backgroundColor: T.chip2, borderRadius: 16, height: 50, paddingHorizontal: 14, fontSize: 16, borderWidth: err ? 1 : 0, borderColor: '#D32F2F' }} />
            {!!err && <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 6 }}>{err}</Text>}
            <Text style={{ fontSize: 12, fontWeight: '700', color: T.deep, letterSpacing: 0.8, marginTop: 14, marginBottom: 8 }}>DESCRIPTION (OPTIONAL)</Text>
            <TextInput value={desc} onChangeText={setDesc} maxLength={30} placeholder="Short description" placeholderTextColor={T.muted}
              style={{ backgroundColor: T.chip2, borderRadius: 16, height: 50, paddingHorizontal: 14, fontSize: 16 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.chip2, borderRadius: 16, padding: 14, marginTop: 14 }}>
              <Ionicons name="wallet-outline" size={22} color={T.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: T.text }}>Money account</Text>
                <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{modal?.id && entriesOf(modal.id) > 0 && isAcc ? 'Has entries, cannot be turned off' : `Tracks its own balance. Starts at ${fmt(0, ledger.currency)}.`}</Text>
              </View>
              <Toggle value={isAcc} onChange={(v) => { if (!v && modal?.id && entriesOf(modal.id) > 0) return; setIsAcc(v); }} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: T.deep, letterSpacing: 0.8, marginTop: 14, marginBottom: 8 }}>ICON</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CAT_ICONS.map((ic) => (
                <TouchableOpacity key={ic} onPress={() => setIcon(ic)} style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: icon === ic ? T.deep : T.chip2 }}>
                  <Ionicons name={ic} size={21} color={icon === ic ? '#fff' : T.sub} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <Btn title="Cancel" kind="soft" style={{ flex: 1 }} onPress={() => setModal(null)} />
              <Btn title="Save" style={{ flex: 1 }} onPress={save} />
            </View>
            {modal?.id && cats.length > 1 && <Btn title="Delete Category" kind="ghost" icon="trash-outline" style={{ marginTop: 6 }} onPress={remove} />}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
