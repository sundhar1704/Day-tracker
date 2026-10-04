import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme';
import { PageHeader, Card, Avatar, Btn, Toggle } from '../components/UI';
import { useApp } from '../utils/store';
import { streak } from '../utils/stats';

const Group = ({ icon, title, children }) => (
  <View style={{ marginTop: 22 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <Ionicons name={icon} size={16} color={T.deep} />
      <Text style={{ fontSize: 12, fontWeight: '800', color: T.deep, letterSpacing: 0.8 }}>{title}</Text>
    </View>
    <View style={{ gap: 8 }}>{children}</View>
  </View>
);

const Row = ({ icon, title, sub, onPress, right }) => (
  <TouchableOpacity activeOpacity={onPress ? 0.85 : 1} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14 }}>
    <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: T.chip2, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={19} color={T.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: T.text }}>{title}</Text>
      {!!sub && <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{sub}</Text>}
    </View>
    {right ?? (onPress && <Ionicons name="chevron-forward" size={18} color={T.muted} />)}
  </TouchableOpacity>
);

export default function ProfileScreen({ nav, onLogout }) {
  const { profile, tasks, cats, notif, setNotif } = useApp();
  const first = (profile.name || '').split(' ')[0];
  const handle = '@' + (profile.email || '').split('@')[0];
  const soon = (t) => () => Alert.alert(t, 'This page is coming soon.');
  const confirmOut = () => Alert.alert('Sign out?', 'You will need to log in again.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: onLogout }]);

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title="Profile" onBack={nav.pop} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <Card style={{ alignItems: 'center', paddingVertical: 22 }}>
          <View style={{ padding: 4, borderRadius: 56, borderWidth: 3, borderColor: T.mint }}><Avatar size={88} photo={profile.photo} name={profile.name} /></View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: T.dark, marginTop: 12 }}>{profile.name}</Text>
          <Text style={{ fontSize: 13, color: T.primary, fontWeight: '600' }}>{handle}</Text>
          <Text style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{profile.email}</Text>
          <View style={{ flexDirection: 'row', marginTop: 18, alignSelf: 'stretch' }}>
            {[[tasks.filter((t) => t.done).length, 'Tasks Done'], [cats.length, 'Categories'], [streak(tasks), 'Day Streak']].map(([n, l], i) => (
              <View key={l} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: T.chip }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: T.dark }}>{n}</Text>
                <Text style={{ fontSize: 11, color: T.sub }}>{l}</Text>
              </View>
            ))}
          </View>
          <Btn title="Edit Personal Details" icon="create-outline" style={{ alignSelf: 'stretch', marginTop: 18 }} onPress={() => nav.push('EditProfile')} />
        </Card>

        <Group icon="apps-outline" title="APP FEATURES & TOOLS">
          <Row icon="sparkles-outline" title="Smart Daily Focus" sub="Prioritized plan with progress for today" onPress={() => nav.go('Today')} />
          <Row icon="folder-outline" title="Category Organization" sub="Track balance, income and spending" onPress={() => nav.go('Categories')} />
          <Row icon="list-outline" title="Milestones & Subtasks" sub="Weekly and monthly calendar progress" onPress={() => nav.go('Calendar')} />
          <Row icon="trending-up-outline" title="Analytics & Momentum" sub="Charts, streaks and PDF reports" onPress={() => nav.go('Analytics')} />
          <Row icon="checkbox-outline" title="Completed Archive" sub="Everything you have finished" onPress={() => nav.go('Completed')} />
        </Group>

        <Group icon="settings-outline" title="ACCOUNT & PREFERENCES">
          <Row icon="notifications-outline" title="Daily Reminders" sub="Morning briefing at 8:30 AM" right={<Toggle value={notif.morning} onChange={(v) => setNotif({ morning: v })} />} />
          <Row icon="flame-outline" title="Streak Protection" sub="Evening reminder to keep your streak" right={<Toggle value={notif.evening} onChange={(v) => setNotif({ evening: v })} />} />
          <Row icon="color-palette-outline" title="Theme & Appearance" sub="Fresh Mint" right={<Text style={{ fontSize: 12, fontWeight: '700', color: T.primary }}>Default</Text>} />
          <Row icon="megaphone-outline" title="Notification Feed & Reminders" sub="Choose what to be notified about" onPress={() => nav.push('Notifications')} />
        </Group>

        <Group icon="shield-checkmark-outline" title="SUPPORT & TRUST">
          <Row icon="chatbubble-ellipses-outline" title="Chat with Support" sub="We're here to help you stay organized" onPress={soon('Support')} />
          <Row icon="document-text-outline" title="Terms & Conditions" onPress={soon('Terms & Conditions')} />
          <Row icon="lock-closed-outline" title="Privacy Policy" onPress={soon('Privacy Policy')} />
          <Row icon="information-circle-outline" title="TaskMaster" sub="Version 1.0.0" />
        </Group>

        <TouchableOpacity onPress={confirmOut} style={{ marginTop: 24, height: 54, borderRadius: 18, backgroundColor: '#FFE3E0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Ionicons name="log-out-outline" size={20} color="#B71C1C" />
          <Text style={{ color: '#B71C1C', fontWeight: '800', fontSize: 16 }}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: 'center', color: T.muted, fontSize: 11, marginTop: 10 }}>Logged in as {first || profile.email} • Data is stored on this device</Text>
      </ScrollView>
    </View>
  );
}
