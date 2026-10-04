import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme';
import { PageHeader, Card, Btn, Toggle, Chip } from '../components/UI';
import { useApp } from '../utils/store';
import Logo from '../components/Logo';
import { TONES, message, sendTest, notificationsSupported } from '../utils/notify';
import { dueDate, fmtShort, fmtTime } from '../utils/dates';

const Sec = ({ title, sub }) => (
  <View style={{ marginTop: 24, marginBottom: 10 }}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: T.dark }}>{title}</Text>
    {!!sub && <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{sub}</Text>}
  </View>
);
const Tog = ({ icon, title, sub, k, n, setNotif }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14 }}>
    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: T.chip2, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={icon} size={20} color={T.primary} /></View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: T.text }}>{title}</Text>
      <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{sub}</Text>
    </View>
    <Toggle value={n[k]} onChange={(v) => setNotif({ [k]: v })} />
  </View>
);

export default function NotificationsScreen({ nav }) {
  const { notif: n, setNotif, tasks, profile } = useApp();
  const now = new Date();
  const first = (profile.name || '').split(' ')[0];
  const upcoming = tasks.filter((t) => !t.done).map((t) => ({ t, at: dueDate(t) })).filter((x) => x.at > now).sort((a, b) => a.at - b.at).slice(0, 5);

  const test = async () => {
    const r = await sendTest(n, profile.name);
    if (r === 'ok') Alert.alert('Test sent', 'A test notification will appear in about 2 seconds. Switch to the home screen if you do not see it.');
    else if (r === 'unsupported') Alert.alert('Not available in Expo Go', 'Phone notifications need a development build. Your settings are saved and will work once you build the app.');
    else Alert.alert('Notifications blocked', 'Allow notifications for this app in your phone settings, then try again.');
  };

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Notifications & Reminders" onBack={nav.pop} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {!notificationsSupported && (
          <View style={{ flexDirection: 'row', gap: 10, backgroundColor: '#FFF1D6', borderRadius: 16, padding: 14, marginBottom: 14 }}>
            <Ionicons name="warning-outline" size={22} color="#8A5A00" />
            <Text style={{ flex: 1, fontSize: 12, color: '#6B4600', lineHeight: 18 }}>You are running inside Expo Go, which cannot show scheduled phone notifications. Your settings are saved. Install the development build of this app (see the steps) and every reminder below will fire with sound.</Text>
          </View>
        )}
        <Text style={{ fontSize: 11, fontWeight: '800', color: T.primary, letterSpacing: 0.8 }}>● LIVE PREVIEW</Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: T.dark, marginTop: 4 }}>Notification Feed</Text>

        <View style={{ backgroundColor: T.dark, borderRadius: 24, padding: 18, marginTop: 14 }}>
          <Text style={{ textAlign: 'center', fontSize: 44, fontWeight: '800', color: '#fff' }}>{fmtTime(now).slice(0, 5)}</Text>
          <Text style={{ textAlign: 'center', color: '#CDEFD0', fontSize: 12, marginBottom: 14 }}>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 18, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Logo size={24} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: T.sub }}>TASKMASTER • now</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '800', color: T.dark, marginTop: 8 }}>Good morning{first ? `, ${first}` : ''}</Text>
            <Text style={{ fontSize: 13, color: T.text, marginTop: 2, lineHeight: 19 }}>{message(n, 'morning')}</Text>
          </View>
        </View>
        <Btn title="Send Test Push Notification" icon="paper-plane-outline" style={{ marginTop: 14 }} onPress={test} />

        <Sec title="Upcoming Reminders" sub="Smart alerts fire at each task's due time" />
        <View style={{ gap: 8 }}>
          {upcoming.length ? upcoming.map(({ t, at }) => (
            <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14 }}>
              <Ionicons name="alarm-outline" size={22} color={T.primary} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontWeight: '700', color: T.text }}>{t.title}</Text>
                <Text style={{ fontSize: 12, color: T.muted }}>{fmtShort(at)} • {t.time}</Text>
              </View>
              {n.smart && notificationsSupported ? <Chip label="Scheduled" bg={T.mint} fg={T.deep} /> : <Chip label={n.smart ? 'Needs dev build' : 'Off'} bg={T.chip} />}
            </View>
          )) : <Card><Text style={{ color: T.muted, textAlign: 'center' }}>No upcoming reminders. Add a task with a due time to get one.</Text></Card>}
        </View>

        <Sec title="Daily Habit & Focus Nudges" sub="Gentle prompts to keep you on track" />
        <View style={{ gap: 8 }}>
          <Tog icon="sunny-outline" title="Morning Briefing" sub="Daily overview at 8:30 AM" k="morning" n={n} setNotif={setNotif} />
          <Tog icon="alarm-outline" title="Smart Task Alerts" sub="Reminder at each task's due time" k="smart" n={n} setNotif={setNotif} />
          <Tog icon="moon-outline" title="Evening Mindful Review" sub="Reflect on your day at 8:00 PM" k="evening" n={n} setNotif={setNotif} />
          <Tog icon="leaf-outline" title="Weekend Gentle Reminders" sub="A light check-in on Sat & Sun, 10:00 AM" k="weekend" n={n} setNotif={setNotif} />
        </View>

        <Sec title="Notification Vibe & Tone" sub="Choose how your messages sound" />
        <View style={{ gap: 8 }}>
          {Object.entries(TONES).map(([k, v]) => {
            const on = n.tone === k;
            return (
              <TouchableOpacity key={k} onPress={() => setNotif({ tone: k })} activeOpacity={0.9}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: on ? '#DDF7DF' : '#fff', borderRadius: 16, padding: 14, borderWidth: on ? 1.5 : 0, borderColor: T.primary }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: T.text }}>{v.label}</Text>
                  <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{v.hint}</Text>
                </View>
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={T.primary} />
              </TouchableOpacity>
            );
          })}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: T.text }}>Motivational Smile Emojis 😊</Text>
              <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Add an emoji to every message</Text>
            </View>
            <Toggle value={n.emoji} onChange={(v) => setNotif({ emoji: v })} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 16, padding: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: T.text, flex: 1 }}>Alert Tone</Text>
            {['Gentle Chime', 'Soft Bell', 'Silent'].map((s) => (
              <TouchableOpacity key={s} onPress={() => setNotif({ sound: s })} style={{ paddingHorizontal: 10, height: 32, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: n.sound === s ? T.deep : T.chip2 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: n.sound === s ? '#fff' : T.sub }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 11, color: T.muted, textAlign: 'center', marginTop: 18, lineHeight: 16 }}>Notifications respect your phone's Do Not Disturb and Sleep Focus settings.</Text>
      </ScrollView>
    </View>
  );
}
