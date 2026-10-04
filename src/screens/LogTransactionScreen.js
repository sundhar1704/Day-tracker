import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { T, shadow } from '../theme';
import { PageHeader, Card, Btn, Chip, Sheet, Avatar } from '../components/UI';
import { useApp } from '../utils/store';
import { fmt, parseAmount, CURRENCIES } from '../utils/money';
import { balanceAsOf, scoped } from '../utils/ledger';
import { dayKey, fmtTime, fmtShort } from '../utils/dates';
import { choosePhoto } from '../utils/media';

const METHODS = [['Cash', 'cash-outline'], ['Card', 'card-outline'], ['Bank Transfer', 'business-outline'], ['UPI / Wallet', 'qr-code-outline']];
const Lbl = ({ children, right }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 10 }}>
    <Text style={{ fontSize: 15, fontWeight: '700', color: T.text }}>{children}</Text>{right}
  </View>
);
const field = { backgroundColor: T.chip2, borderRadius: 16, minHeight: 50, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 };

export default function LogTransactionScreen({ nav, accountId, presetType = 'DR' }) {
  const { ledger: full, cats: taskCats, profile, addTxn, addLedgerCat } = useApp();
  const ledger = scoped(full, accountId);
  const account = taskCats.find((c) => c.id === accountId);
  const cur = ledger.currency;
  const [type, setType] = useState(presetType);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('');
  const [when, setWhen] = useState(new Date());
  const [method, setMethod] = useState('Cash');
  const [ref, setRef] = useState(`#TM-${ledger.refSeq + 1}`);
  const [receipt, setReceipt] = useState(null);
  const [picker, setPicker] = useState(null);
  const [tag, setTag] = useState(null); // null | string (new tag sheet)
  const [tagErr, setTagErr] = useState('');
  const [errs, setErrs] = useState({});

  const isDR = type === 'DR';
  const accent = isDR ? '#C62828' : T.primary;
  const amt = parseAmount(amount);
  const bal = balanceAsOf(ledger, dayKey());
  const after = bal + (isDR ? -amt : amt);
  const cats = ledger.cats.filter((c) => c.type === type);
  const whenLabel = `${dayKey(when) === dayKey() ? 'Today' : fmtShort(when)}, ${fmtTime(when)}`;

  const setAmt = (v) => { setAmount(v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')); setErrs({ ...errs, amount: undefined }); };
  const switchType = (t) => { setType(t); setCat(''); };
  const resetAll = () => { setAmount(''); setDesc(''); setCat(''); setWhen(new Date()); setMethod('Cash'); setReceipt(null); setErrs({}); };

  const submit = (another) => {
    const e = {};
    if (amt <= 0) e.amount = 'Enter an amount greater than 0';
    if (!desc.trim()) e.desc = 'Add a short description';
    if (!cat) e.cat = 'Choose a category';
    setErrs(e);
    if (Object.keys(e).length) return;
    addTxn({ account: accountId, type, amount: amt, desc: desc.trim(), category: cat, date: dayKey(when), time: fmtTime(when), method, ref: ref.trim() || `#TM-${ledger.refSeq + 1}`, hasReceipt: !!receipt }, receipt);
    if (another) { resetAll(); setRef(`#TM-${ledger.refSeq + 2}`); } else nav.pop();
  };

  const onPick = (e, d) => {
    if (Platform.OS === 'android') setPicker(null);
    if (e.type === 'dismissed' || !d) return;
    const n = new Date(when);
    if (picker === 'date') { n.setFullYear(d.getFullYear(), d.getMonth(), d.getDate()); setWhen(n); if (Platform.OS === 'android') setTimeout(() => setPicker('time'), 250); }
    else { n.setHours(d.getHours(), d.getMinutes(), 0, 0); setWhen(n); }
  };
  const saveTag = () => { const r = addLedgerCat({ name: tag, type }); if (r) return setTagErr(r); setCat(tag.trim()); setTag(null); setTagErr(''); };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Task Detail" onBack={nav.pop} right={[<Avatar key="a" size={40} photo={profile.photo} name={profile.name} dark={false} />]} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: T.chip, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="wallet-outline" size={22} color={T.deep} /></View>
            <View><Text style={{ fontSize: 22, fontWeight: '800', color: T.dark }}>Log Transaction</Text><Text style={{ fontSize: 12, color: T.sub }}>{account?.name || 'General'} Cash Ledger</Text></View>
          </View>
          <TouchableOpacity onPress={resetAll} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: T.chip, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99 }}>
            <Ionicons name="refresh" size={13} color={T.deep} /><Text style={{ fontSize: 12, fontWeight: '700', color: T.deep }}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: T.deep, borderRadius: 26, padding: 18, marginTop: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: T.mint, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>● ACTIVE LEDGER SCOPE</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 }}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Live Sync</Text></View>
          </View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 }}>Daily Budget & Expenses</Text>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 18, padding: 14, marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={{ color: '#CDEFD0', fontSize: 13 }}>Available Balance</Text>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2 }}>{fmt(bal, cur)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: after >= 0 ? T.mint : '#FFB4AB', fontWeight: '800', fontSize: 13 }}>{amt > 0 ? (after >= 0 ? 'Safe to Spend' : 'Overspending') : 'Enter an amount'}</Text>
              <Text style={{ color: '#CDEFD0', fontSize: 12, marginTop: 2 }}>{amt > 0 ? `After entry ${fmt(after, cur)}` : 'to preview balance'}</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: T.chip, borderRadius: 99, padding: 4, marginTop: 14 }}>
          {[['DR', 'Debit / Spend (DR)', 'arrow-up-outline', '#C62828'], ['CR', 'Credit / Income (CR)', 'arrow-down-outline', T.primary]].map(([k, l, ic, col]) => (
            <TouchableOpacity key={k} onPress={() => switchType(k)} style={{ flex: 1, height: 46, borderRadius: 99, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: type === k ? '#fff' : 'transparent', ...(type === k ? shadow : {}) }}>
              <Ionicons name={ic} size={15} color={type === k ? col : T.sub} />
              <Text style={{ fontWeight: '700', fontSize: 13, color: type === k ? col : T.sub }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={{ marginTop: 14, borderRadius: 24, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: T.sub, letterSpacing: 0.6 }}>ENTER AMOUNT</Text>
            <Chip label={CURRENCIES[cur].label} bg={T.chip} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
            <Text style={{ fontSize: 40, fontWeight: '800', color: accent, marginRight: 10 }}>{CURRENCIES[cur].sym}</Text>
            <TextInput value={amount} onChangeText={setAmt} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#B5C2B7" style={{ fontSize: 44, fontWeight: '800', color: T.text, minWidth: 140, padding: 0 }} />
          </View>
          {!!errs.amount && <Text style={{ color: '#D32F2F', fontSize: 12, textAlign: 'center', marginTop: 4 }}>{errs.amount}</Text>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 16 }}>
            {[100, 500, 1000, 2000].map((n) => (
              <TouchableOpacity key={n} onPress={() => setAmt(String(parseAmount(amount) + n))} style={{ backgroundColor: T.chip, paddingHorizontal: 16, height: 40, borderRadius: 99, justifyContent: 'center' }}>
                <Text style={{ fontWeight: '700', color: T.sub }}>+{CURRENCIES[cur].sym}{n.toLocaleString('en-US')}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setAmount('')} style={{ backgroundColor: T.chip, paddingHorizontal: 22, height: 40, borderRadius: 99, justifyContent: 'center' }}><Text style={{ fontWeight: '700', color: T.sub }}>Clear</Text></TouchableOpacity>
          </View>
        </Card>

        <Card style={{ marginTop: 14, borderRadius: 24, padding: 18 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: T.text }}>Description / Purpose</Text>
          <View style={[field, { marginTop: 10, borderWidth: errs.desc ? 1 : 0, borderColor: '#D32F2F' }]}>
            <Ionicons name="create-outline" size={20} color={T.sub} />
            <TextInput value={desc} onChangeText={(v) => { setDesc(v); setErrs({ ...errs, desc: undefined }); }} maxLength={60} placeholder={isDR ? 'Groceries at Whole Foods' : 'Client project deposit'} placeholderTextColor={T.muted} style={{ flex: 1, fontSize: 15, color: T.text }} />
          </View>
          {!!errs.desc && <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 6 }}>{errs.desc}</Text>}

          <Lbl right={<TouchableOpacity onPress={() => { setTag(''); setTagErr(''); }}><Text style={{ color: T.primary, fontWeight: '700' }}>+ New Tag</Text></TouchableOpacity>}>Category Allocation</Lbl>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {cats.map((c) => (
              <TouchableOpacity key={c.id} onPress={() => { setCat(c.name); setErrs({ ...errs, cat: undefined }); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 40, borderRadius: 99, backgroundColor: cat === c.name ? T.deep : T.chip2 }}>
                <Ionicons name={c.icon} size={15} color={cat === c.name ? '#fff' : T.sub} />
                <Text style={{ fontWeight: '700', color: cat === c.name ? '#fff' : T.sub }}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {!!errs.cat && <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: 6, marginLeft: 6 }}>{errs.cat}</Text>}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Lbl>Date & Time</Lbl>
              <TouchableOpacity onPress={() => setPicker(Platform.OS === 'ios' ? 'datetime' : 'date')} style={field}>
                <Ionicons name="calendar-outline" size={18} color={T.deep} /><Text numberOfLines={1} style={{ flex: 1, fontWeight: '700', fontSize: 13, color: T.text }}>{whenLabel}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Lbl>Ledger Ref #</Lbl>
              <View style={field}><Ionicons name="pricetag-outline" size={18} color={T.deep} />
                <TextInput value={ref} onChangeText={setRef} maxLength={16} style={{ flex: 1, fontWeight: '700', fontSize: 13, color: T.text, padding: 0 }} /></View>
            </View>
          </View>
          {picker && (
            <View>
              <DateTimePicker value={when} mode={picker} display={Platform.OS === 'ios' ? 'spinner' : 'default'} maximumDate={new Date(Date.now() + 86400000 * 365)} onChange={onPick} />
              {Platform.OS === 'ios' && <Btn title="Done" kind="soft" style={{ height: 42, marginTop: 6 }} onPress={() => setPicker(null)} />}
            </View>
          )}

          <Lbl>Payment Method</Lbl>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {METHODS.map(([m, ic]) => (
              <TouchableOpacity key={m} onPress={() => setMethod(m)} style={{ width: '48%', height: 50, borderRadius: 16, flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 14, backgroundColor: method === m ? T.mint : T.chip2 }}>
                <Ionicons name={ic} size={19} color={T.deep} /><Text style={{ fontWeight: '700', color: T.deep }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={{ marginTop: 14, borderRadius: 24, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: T.text }}>Supporting Documents</Text><Text style={{ fontSize: 12, color: T.sub }}>Optional</Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} onPress={() => choosePhoto(setReceipt, 'Receipt photo', { edit: false })}
            style={{ marginTop: 12, backgroundColor: T.chip2, borderRadius: 18, paddingVertical: 22, alignItems: 'center' }}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="camera-outline" size={22} color={T.deep} /></View>
            <Text style={{ fontWeight: '700', color: T.text, marginTop: 10 }}>Add receipt photo (optional)</Text>
            <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Take a photo or pick from your gallery</Text>
          </TouchableOpacity>
          {!!receipt && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.chip2, borderRadius: 16, padding: 10, marginTop: 10 }}>
              <Image source={{ uri: receipt }} style={{ width: 52, height: 52, borderRadius: 10 }} />
              <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', color: T.text }}>receipt_{dayKey(when)}.jpg</Text><Text style={{ fontSize: 12, color: T.muted }}>{Math.round((receipt.length * 0.75) / 1024)} KB</Text></View>
              <TouchableOpacity onPress={() => setReceipt(null)} hitSlop={10}><Ionicons name="close" size={22} color={T.sub} /></TouchableOpacity>
            </View>
          )}
        </Card>

        <Btn title="Save to Ledger" icon="checkmark-circle-outline" style={{ marginTop: 20 }} onPress={() => submit(false)} />
        <Btn title="+  Save & Add Another" kind="soft" style={{ marginTop: 10 }} onPress={() => submit(true)} />
      </ScrollView>

      <Sheet visible={tag !== null} onClose={() => setTag(null)} title={`New ${isDR ? 'Spending' : 'Income'} Tag`}>
        <TextInput value={tag || ''} onChangeText={(v) => { setTag(v); setTagErr(''); }} maxLength={20} autoFocus placeholder="e.g. Groceries" placeholderTextColor={T.muted}
          style={{ backgroundColor: T.chip2, borderRadius: 16, height: 50, paddingHorizontal: 14, fontSize: 16, borderWidth: tagErr ? 1 : 0, borderColor: '#D32F2F' }} />
        {!!tagErr && <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 6 }}>{tagErr}</Text>}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Btn title="Cancel" kind="soft" style={{ flex: 1 }} onPress={() => setTag(null)} />
          <Btn title="Add Tag" style={{ flex: 1 }} onPress={saveTag} />
        </View>
      </Sheet>
    </KeyboardAvoidingView>
  );
}
