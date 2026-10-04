import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme';
import { Btn } from './UI';
import { useApp } from '../utils/store';
import { sharePdf, emailPdf, whatsappText } from '../utils/export';

// Shared by Analytics and the Ledger report: PDF download, email with attachment, WhatsApp (PDF or text)
export default function ReportActions({ buildHtml, buildText, subject, canExport = true, emptyMessage = 'There is nothing to export yet.' }) {
  const { profile } = useApp();
  const [email, setEmail] = useState(profile.email || '');
  const [busy, setBusy] = useState(null);

  const run = async (key, fn) => {
    if (busy) return;
    if (!canExport) return Alert.alert('Nothing to export', emptyMessage);
    setBusy(key);
    try { await fn(); } catch (e) { Alert.alert('Could not complete that', String(e?.message || e)); }
    setBusy(null);
  };
  const ok = /^\S+@\S+\.\S+$/.test(email.trim());

  return (
    <View>
      <Btn title={busy === 'pdf' ? 'Preparing PDF…' : 'Download PDF Report'} icon="download-outline" style={{ marginTop: 12 }}
        onPress={() => run('pdf', () => sharePdf(buildHtml(), 'Save or share report'))} />
      <Text style={{ fontSize: 11, color: T.muted, marginTop: 6, textAlign: 'center' }}>Choose Files / Drive in the sheet to keep a copy on your phone</Text>

      <Text style={{ fontSize: 11, fontWeight: '800', color: T.deep, letterSpacing: 0.8, marginTop: 16, marginBottom: 8 }}>SEND REPORT TO EMAIL</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.chip2, borderRadius: 16, paddingHorizontal: 14, height: 50, gap: 10 }}>
        <Ionicons name="mail-outline" size={19} color={T.sub} />
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="name@example.com" placeholderTextColor={T.muted} style={{ flex: 1, fontSize: 15, color: T.text }} />
      </View>
      <Btn title={busy === 'mail' ? 'Opening mail…' : 'Send PDF to Email'} kind="soft" icon="paper-plane-outline" style={{ marginTop: 10 }}
        onPress={() => run('mail', async () => {
          if (email.trim() && !ok) throw new Error('Enter a valid email address.');
          await emailPdf({ html: buildHtml(), to: email.trim(), subject, body: `${subject}\n\nThe full report is attached as a PDF.` });
        })} />

      <Text style={{ fontSize: 11, fontWeight: '800', color: T.deep, letterSpacing: 0.8, marginTop: 16, marginBottom: 8 }}>SEND ON WHATSAPP</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity onPress={() => run('wapdf', () => sharePdf(buildHtml(), 'Choose WhatsApp'))}
          style={{ flex: 1, height: 52, borderRadius: 16, backgroundColor: '#DCF8C6', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="logo-whatsapp" size={20} color="#128C7E" /><Text style={{ fontWeight: '800', color: '#0B5B50' }}>{busy === 'wapdf' ? 'Preparing…' : 'PDF'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => run('watext', () => whatsappText(buildText()))}
          style={{ flex: 1, height: 52, borderRadius: 16, backgroundColor: '#DCF8C6', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="logo-whatsapp" size={20} color="#128C7E" /><Text style={{ fontWeight: '800', color: '#0B5B50' }}>Text</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 11, color: T.muted, marginTop: 6, textAlign: 'center' }}>For PDF, pick WhatsApp from the share sheet, then choose a contact</Text>
    </View>
  );
}
