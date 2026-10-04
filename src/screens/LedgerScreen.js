import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { T, shadow } from '../theme';
import { AppHeader, Card, Btn, Chip, Sheet, Empty } from '../components/UI';
import LedgerReport from '../components/LedgerReport';
import { useApp, getReceipt } from '../utils/store';
import { fmt, parseAmount, CURRENCIES } from '../utils/money';
import { sumOf, balanceAsOf, newestFirst, dayLabel, dateLabel, iconFor, scoped } from '../utils/ledger';
import { dayKey, addDays, parseKey } from '../utils/dates';

const Row = ({ icon, title, sub, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.chip2, borderRadius: 16, padding: 14, marginBottom: 10 }}>
    <Ionicons name={icon} size={22} color={T.primary} />
    <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', color: T.text, fontSize: 15 }}>{title}</Text>{!!sub && <Text style={{ fontSize: 12, color: T.muted }}>{sub}</Text>}</View>
    <Ionicons name="chevron-forward" size={18} color={T.muted} />
  </TouchableOpacity>
);

export default function LedgerScreen({ nav, accountId }) {
  const { ledger: full, cats, setOpening, setCurrency, deleteTxn } = useApp();
  const account = cats.find((c) => c.id === accountId);
  const ledger = scoped(full, accountId);
  const cur = ledger.currency;
  const today = dayKey();
  const [asOf, setAsOf] = useState(today);
  const [filter, setFilter] = useState('All');
  const [sheet, setSheet] = useState(null); // 'options' | 'opening' | 'currency' | 'report' | 'date'
  const [openingText, setOpeningText] = useState('');
  const [detail, setDetail] = useState(null);
  const [rcpt, setRcpt] = useState(null);

  useEffect(() => { if (!account) nav.pop(); }, [account]);
  useEffect(() => { setRcpt(null); if (detail?.hasReceipt) getReceipt(detail.id).then(setRcpt); }, [detail]);

  if (!account) return null;
  const fresh = !ledger.txns.length && !full.openings?.[accountId];
  const upto = ledger.txns.filter((t) => t.date <= asOf);
  const credit = sumOf(upto, 'CR'), debit = sumOf(upto, 'DR');
  const net = (ledger.opening || 0) + credit - debit;
  const prevKey = dayKey(addDays(parseKey(asOf), -1));
  const prev = balanceAsOf(ledger, prevKey);
  const pct = prev !== 0 ? ((net - prev) / Math.abs(prev)) * 100 : null;
  const dayNet = sumOf(ledger.txns.filter((t) => t.date === asOf), 'CR') - sumOf(ledger.txns.filter((t) => t.date === asOf), 'DR');
  const closes = [4, 3, 2, 1, 0].map((i) => balanceAsOf(ledger, dayKey(addDays(parseKey(asOf), -i))));
  const maxClose = Math.max(1, ...closes.map(Math.abs));

  const shown = upto.filter((t) => filter === 'All' || t.type === filter).sort(newestFirst);
  const dates = [...new Set(shown.map((t) => t.date))];
  const asOfLabel = asOf === today ? `Today, ${dateLabel(asOf)}` : dateLabel(asOf);

  const saveOpening = () => { setOpening(accountId, parseAmount(openingText)); setSheet(null); };
  const confirmDelete = (t) => Alert.alert('Delete entry?', `${t.desc} — this will change your balance.`, [
    { text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { deleteTxn(t.id); setDetail(null); } }]);

  const onDate = (e, d) => {
    if (Platform.OS === 'android') setSheet(null);
    if (e.type === 'dismissed' || !d) return;
    const k = dayKey(d); setAsOf(k > today ? today : k);
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader sub="Categories" nav={nav} dot={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={nav.pop} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow }}>
            <Ionicons name="arrow-back" size={20} color={T.deep} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={2} style={{ fontSize: 22, fontWeight: '800', color: T.dark }}>{account.name} Ledger & Balance</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: T.primary, marginTop: 2 }}>● Live Synchronized Cashbook</Text>
          </View>
          <TouchableOpacity onPress={() => setSheet('options')} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow }}>
            <Ionicons name="options-outline" size={20} color={T.deep} />
          </TouchableOpacity>
        </View>

        <>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 20, height: 52, paddingHorizontal: 8, ...shadow }}>
                <TouchableOpacity hitSlop={10} onPress={() => setAsOf(prevKey)} style={{ padding: 6 }}><Ionicons name="chevron-back" size={18} color={T.sub} /></TouchableOpacity>
                <TouchableOpacity onPress={() => setSheet('date')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: T.chip2, paddingHorizontal: 12, height: 34, borderRadius: 99 }}>
                  <Ionicons name="calendar-outline" size={15} color={T.deep} /><Text style={{ fontWeight: '700', color: T.deep, fontSize: 13 }}>{asOfLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity hitSlop={10} disabled={asOf >= today} onPress={() => setAsOf(dayKey(addDays(parseKey(asOf), 1)))} style={{ padding: 6, opacity: asOf >= today ? 0.3 : 1 }}><Ionicons name="chevron-forward" size={18} color={T.sub} /></TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setSheet('currency')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, height: 52, paddingHorizontal: 14, ...shadow }}>
                <Text style={{ fontWeight: '800', color: T.deep }}>{cur} ({CURRENCIES[cur].sym})</Text><Ionicons name="chevron-down" size={16} color={T.sub} />
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: T.deep, borderRadius: 28, padding: 20, marginTop: 14, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#BFE8C3', fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>CURRENT NET BALANCE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>{fmt(net, cur)}</Text>
                    {pct !== null && <View style={{ backgroundColor: T.mint, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 }}><Text style={{ color: T.deep, fontSize: 12, fontWeight: '800' }}>{pct >= 0 ? '↗ +' : '↘ '}{pct.toFixed(1)}%</Text></View>}
                  </View>
                </View>
                <TouchableOpacity onPress={() => { setOpeningText(String(ledger.opening || '')); setSheet('opening'); }} style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="create-outline" size={21} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 22 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: dayNet >= 0 ? T.mint : '#FFB4AB', fontSize: 14, fontWeight: '600' }}>● {dayNet > 0 ? 'Positive cash flow velocity' : dayNet < 0 ? 'Spending is above income today' : 'No movement on this day'}</Text>
                  <Text style={{ color: '#BFE8C3', fontSize: 11, marginTop: 4 }}>Opening balance {fmt(ledger.opening || 0, cur)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 36 }}>
                  {closes.map((c, i) => <View key={i} style={{ width: 7, height: Math.max(6, (Math.abs(c) / maxClose) * 36), borderRadius: 4, backgroundColor: i === 4 ? T.mint : 'rgba(156,244,156,0.45)' }} />)}
                </View>
              </View>
            </View>

            {fresh && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#DDF7DF', borderRadius: 16, padding: 12, marginTop: 12 }}>
                <Ionicons name="information-circle-outline" size={20} color={T.primary} />
                <Text style={{ flex: 1, fontSize: 12, color: T.deep }}>This account starts at {fmt(0, cur)}. Tap the pencil on the balance card to set your current balance, or just log your first entry.</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              {[['CR IN', 'arrow-down-outline', 'Total Credit', fmt(credit, cur, true), T.primary, '#C8F5CB'], ['DR OUT', 'arrow-up-outline', 'Total Debit', debit ? '-' + fmt(debit, cur) : fmt(0, cur), '#C62828', '#FFDAD6']].map(([tag, ic, l, v, col, bg]) => (
                <Card key={tag} style={{ flex: 1, padding: 14, borderRadius: 22 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={ic} size={20} color={col} /></View>
                    <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}><Text style={{ color: col, fontSize: 11, fontWeight: '800' }}>{tag}</Text></View>
                  </View>
                  <Text style={{ color: T.sub, fontSize: 13, marginTop: 10 }}>{l}</Text>
                  <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: col, fontSize: 20, fontWeight: '800', marginTop: 2 }}>{v}</Text>
                </Card>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
              {[['All', `All Entries (${upto.length})`, null], ['CR', 'Income (CR)', T.primary], ['DR', 'Expenses (DR)', '#C62828']].map(([k, l, dot]) => (
                <TouchableOpacity key={k} onPress={() => setFilter(k)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 40, borderRadius: 99, backgroundColor: filter === k ? T.deep : T.chip }}>
                  {dot && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: filter === k ? '#fff' : dot }} />}
                  <Text style={{ fontWeight: '700', color: filter === k ? '#fff' : T.sub }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {dates.length ? dates.map((d) => (
              <View key={d}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: T.dark }}>{dayLabel(d)}</Text><Text style={{ fontSize: 13, color: T.sub }}>{dateLabel(d)}</Text>
                  </View>
                  <View style={{ backgroundColor: T.chip, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: T.sub }}>Day Close: <Text style={{ color: T.deep }}>{fmt(balanceAsOf(ledger, d), cur)}</Text></Text>
                  </View>
                </View>
                <View style={{ gap: 10 }}>
                  {shown.filter((t) => t.date === d).map((t) => {
                    const cr = t.type === 'CR', col = cr ? T.primary : '#C62828';
                    return (
                      <TouchableOpacity key={t.id} activeOpacity={0.9} onPress={() => setDetail(t)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 20, padding: 14, ...shadow }}>
                        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: cr ? '#C8F5CB' : '#FFDAD6', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name={iconFor(ledger, t.category)} size={22} color={col} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700', color: T.text }}>{t.desc}</Text>
                          <Text numberOfLines={1} style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{t.time} • {t.method}{t.hasReceipt ? ' • 📎' : ''}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: col }}>{fmt(cr ? t.amount : -t.amount, cur, true)}</Text>
                          <View style={{ backgroundColor: cr ? '#C8F5CB' : '#FFDAD6', paddingHorizontal: 9, paddingVertical: 2, borderRadius: 7 }}><Text style={{ color: col, fontSize: 11, fontWeight: '800' }}>{t.type}</Text></View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )) : (
              <Card style={{ marginTop: 18 }}><Empty icon="receipt-outline" title="No entries yet" text="Tap the green button to log your first debit or credit." /></Card>
            )}
        </>
      </ScrollView>

      {(
        <TouchableOpacity activeOpacity={0.9} onPress={() => nav.push('LogTransaction', { accountId })}
          style={{ position: 'absolute', alignSelf: 'center', bottom: 14, height: 56, paddingHorizontal: 26, borderRadius: 28, backgroundColor: T.primary, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 8,
            shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>+ Log New Transaction (CR/DR)</Text>
        </TouchableOpacity>
      )}

      <Sheet visible={sheet === 'options'} onClose={() => setSheet(null)} title="Ledger Options">
        <Row icon="download-outline" title="Download Report" sub="Choose categories, period and type" onPress={() => setSheet('report')} />
        <Row icon="create-outline" title="Edit Opening Balance" sub={`Currently ${fmt(ledger.opening || 0, cur)}`} onPress={() => { setOpeningText(String(ledger.opening || '')); setSheet('opening'); }} />
      </Sheet>

      <Sheet visible={sheet === 'opening'} onClose={() => setSheet(null)} title="Opening Balance">
        <Text style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>The money you started with. Net balance = opening + credits − debits.</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.chip2, borderRadius: 18, height: 60, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: T.primary, marginRight: 8 }}>{CURRENCIES[cur].sym}</Text>
          <TextInput value={openingText} onChangeText={(v) => setOpeningText(v.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" autoFocus placeholder="0.00" placeholderTextColor="#B5C2B7" style={{ flex: 1, fontSize: 26, fontWeight: '800', color: T.text }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Btn title="Cancel" kind="soft" style={{ flex: 1 }} onPress={() => setSheet(null)} />
          <Btn title="Save" style={{ flex: 1 }} onPress={saveOpening} />
        </View>
      </Sheet>

      <Sheet visible={sheet === 'currency'} onClose={() => setSheet(null)} title="Currency">
        <Text style={{ fontSize: 12, color: T.muted, marginBottom: 10 }}>Changes the symbol only; amounts are not converted.</Text>
        {Object.entries(CURRENCIES).map(([k, v]) => (
          <TouchableOpacity key={k} onPress={() => { setCurrency(k); setSheet(null); }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: cur === k ? '#DDF7DF' : T.chip2, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <Text style={{ fontWeight: '700', color: T.text, fontSize: 16 }}>{v.label}</Text>
            {cur === k && <Ionicons name="checkmark-circle" size={22} color={T.primary} />}
          </TouchableOpacity>
        ))}
      </Sheet>

      {sheet === 'date' && (Platform.OS === 'ios'
        ? <Sheet visible onClose={() => setSheet(null)} title="Pick a date"><DateTimePicker value={parseKey(asOf)} mode="date" display="inline" maximumDate={new Date()} onChange={onDate} /><Btn title="Done" style={{ marginTop: 10 }} onPress={() => setSheet(null)} /></Sheet>
        : <DateTimePicker value={parseKey(asOf)} mode="date" maximumDate={new Date()} onChange={onDate} />)}

      <LedgerReport visible={sheet === 'report'} onClose={() => setSheet(null)} ledger={ledger} />

      <Sheet visible={!!detail} onClose={() => setDetail(null)} title={detail?.desc}>
        {detail && (
          <View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: detail.type === 'CR' ? T.primary : '#C62828' }}>{fmt(detail.type === 'CR' ? detail.amount : -detail.amount, cur, true)}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <Chip label={detail.type === 'CR' ? 'Credit (CR)' : 'Debit (DR)'} bg={detail.type === 'CR' ? '#C8F5CB' : '#FFDAD6'} fg={detail.type === 'CR' ? T.primary : '#C62828'} />
              <Chip label={detail.category} /><Chip label={detail.method} bg={T.chip} />
            </View>
            <Text style={{ color: T.sub, marginTop: 12 }}>{dateLabel(detail.date)} • {detail.time} • {detail.ref}</Text>
            {!!rcpt && <Image source={{ uri: rcpt }} resizeMode="contain" style={{ width: '100%', height: 260, borderRadius: 16, marginTop: 14, backgroundColor: T.chip2 }} />}
            <Btn title="Delete Entry" kind="ghost" icon="trash-outline" style={{ marginTop: 14 }} onPress={() => confirmDelete(detail)} />
          </View>
        )}
      </Sheet>
    </View>
  );
}
