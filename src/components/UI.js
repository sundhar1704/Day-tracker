import React from 'react';
import { View, Text, TouchableOpacity, Switch, Image, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { T, shadow } from '../theme';
import { useApp } from '../utils/store';
import Logo from './Logo';

export const Card = ({ children, style }) => (
  <View style={[{ backgroundColor: '#fff', borderRadius: 20, padding: 16, ...shadow }, style]}>{children}</View>
);

export const Chip = ({ label, bg = T.chip2, fg = T.deep, icon }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 }}>
    {icon && <Ionicons name={icon} size={11} color={fg} />}
    <Text style={{ fontSize: 11, fontWeight: '600', color: fg }}>{label}</Text>
  </View>
);

export const SectionTitle = ({ title, right, style }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }, style]}>
    <Text style={{ fontSize: 20, fontWeight: '700', color: T.dark }}>{title}</Text>
    {right}
  </View>
);

export const Toggle = ({ value, onChange }) => (
  <Switch value={value} onValueChange={onChange} trackColor={{ false: '#CFE3D2', true: T.primary }} thumbColor="#fff" />
);

export const Empty = ({ icon = 'leaf-outline', title, text, children }) => (
  <View style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 }}>
    <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: T.chip2, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={32} color={T.primary} />
    </View>
    <Text style={{ fontSize: 18, fontWeight: '700', color: T.dark, marginTop: 14 }}>{title}</Text>
    {!!text && <Text style={{ fontSize: 14, color: T.muted, textAlign: 'center', marginTop: 6 }}>{text}</Text>}
    {children}
  </View>
);

export const Btn = ({ title, onPress, icon, kind = 'primary', style }) => {
  const dark = kind === 'primary';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={[{ height: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: dark ? T.deep : kind === 'soft' ? T.chip : 'transparent' }, dark && shadow, style]}>
      {icon && <Ionicons name={icon} size={19} color={dark ? '#fff' : T.deep} />}
      <Text style={{ color: dark ? '#fff' : T.deep, fontSize: 16, fontWeight: '700' }}>{title}</Text>
    </TouchableOpacity>
  );
};

export function Ring({ size = 64, stroke = 6, pct = 0, color = T.primary, track = T.chip, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${c}`} strokeDashoffset={c * (1 - Math.min(100, Math.max(0, pct)) / 100)} />
      </Svg>
      {children}
    </View>
  );
}

export function Avatar({ size = 40, photo, name = '', dark = true }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('');
  const base = { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
  if (photo) return <Image source={{ uri: photo }} style={base} />;
  return (
    <View style={[base, { backgroundColor: dark ? T.dark : T.chip }]}>
      {initials ? <Text style={{ color: dark ? '#fff' : T.deep, fontWeight: '700', fontSize: size * 0.38 }}>{initials}</Text>
        : <Ionicons name="person" size={size * 0.45} color={dark ? '#fff' : T.deep} />}
    </View>
  );
}

const circle = { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow };

export function AppHeader({ sub, badge, nav, onSearch, dot }) {
  const { profile } = useApp();
  return (
    <View style={{ height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        <Logo size={40} />
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: T.deep }}>TaskMaster</Text>
          {!!sub && <Text style={{ fontSize: 11, color: T.sub, marginTop: -2 }}>{sub}</Text>}
        </View>
        {!!badge && <View style={{ backgroundColor: T.mint, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 }}><Text style={{ fontSize: 12, fontWeight: '600', color: '#19722B' }}>● {badge}</Text></View>}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {onSearch && <TouchableOpacity style={circle} onPress={onSearch}><Ionicons name="search" size={18} color={T.deep} /></TouchableOpacity>}
        <TouchableOpacity style={circle} onPress={() => nav.push('Notifications')}>
          <Ionicons name="notifications-outline" size={19} color={T.deep} />
          {dot && <View style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: T.primary }} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.push('Profile')}><Avatar size={40} photo={profile.photo} name={profile.name} /></TouchableOpacity>
      </View>
    </View>
  );
}

export function PageHeader({ title, onBack, right }) {
  return (
    <View style={{ height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
      <TouchableOpacity onPress={onBack} style={circle}><Ionicons name="arrow-back" size={20} color={T.deep} /></TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: '700', color: T.deep }}>{title}</Text>
      <View style={{ minWidth: 40, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>{right}</View>
    </View>
  );
}

export const IconBtn = ({ name, onPress, color = T.deep }) => (
  <TouchableOpacity onPress={onPress} style={circle}><Ionicons name={name} size={19} color={color} /></TouchableOpacity>
);

const TABS = [['Today', 'calendar-outline'], ['Calendar', 'document-text-outline'], ['Categories', 'folder-outline'], ['Analytics', 'trending-up-outline'], ['Completed', 'checkbox-outline']];
export function BottomNav({ active, onChange }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 10, paddingTop: 6 }}>
      <View style={{ height: 68, borderRadius: 34, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 6,
        shadowColor: T.deep, shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 10 }}>
        {TABS.map(([n, ic]) => {
          const on = active === n;
          return (
            <TouchableOpacity key={n} style={{ flex: 1, alignItems: 'center', gap: 2 }} onPress={() => onChange(n)}>
              <Ionicons name={ic} size={21} color={on ? T.dark : T.sub} />
              <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '600', color: on ? T.dark : T.sub }}>{n}</Text>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: on ? T.primary : 'transparent' }} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export const Fab = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}
    style={{ position: 'absolute', right: 20, bottom: 16, width: 58, height: 58, borderRadius: 29, backgroundColor: '#46A258', alignItems: 'center', justifyContent: 'center', elevation: 8,
      shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}>
    <Ionicons name="add" size={30} color="#fff" />
  </TouchableOpacity>
);

export const Sheet = ({ visible, onClose, title, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
      <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={onClose} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 28, maxHeight: '88%' }}>
        {!!title && <Text style={{ fontSize: 20, fontWeight: '800', color: T.dark, marginBottom: 12 }}>{title}</Text>}
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);
