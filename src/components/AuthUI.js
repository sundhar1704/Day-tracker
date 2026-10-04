import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const C = { dark: '#064E1B', green: '#166A2E', light: '#E9F7EC', bg: '#F0FFF4', text: '#1B2B1F', muted: '#6B7A70' };

export function Field({ label, icon, secure, value, onChangeText, placeholder, keyboardType, error }) {
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.input, error && { borderColor: '#D32F2F', borderWidth: 1 }]}>
        <Ionicons name={icon} size={20} color={C.muted} />
        <TextInput
          style={s.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          secureTextEntry={hidden}
          autoCapitalize="none"
          keyboardType={keyboardType}
        />
        {secure && (
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

export const Checkbox = ({ checked, onPress, children }) => (
  <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
    <View style={[s.box, checked && { backgroundColor: C.green }]}>
      {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
    </View>
    <Text style={s.checkText}>{children}</Text>
  </TouchableOpacity>
);

export const PrimaryButton = ({ title, onPress, loading }) => (
  <TouchableOpacity style={s.btn} onPress={onPress} disabled={loading} activeOpacity={0.85}>
    <Text style={s.btnText}>{loading ? 'Please wait…' : title}</Text>
    {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
  </TouchableOpacity>
);

import Logo from './Logo';

export const Header = ({ title, subtitle }) => (
  <View style={{ alignItems: 'center', marginBottom: 20 }}>
    <View style={s.logoWrap}>
      <Logo size={74} />
    </View>
    <Text style={s.title}>{title}</Text>
    <Text style={s.subtitle}>{subtitle}</Text>
  </View>
);

export const SocialButtons = ({ onPress }) => (
  <View style={{ flexDirection: 'row', gap: 12 }}>
    {[['logo-apple', 'Apple'], ['logo-google', 'Google']].map(([icon, name]) => (
      <TouchableOpacity key={name} style={s.social} onPress={() => onPress(name)}>
        <Ionicons name={icon} size={20} color="#000" />
        <Text style={s.socialText}>{name}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const strength = (p) =>
  Math.min(3, (p.length >= 8) + (/[A-Z]/.test(p) && /[a-z]/.test(p)) + (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)));

const s = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: C.dark, marginBottom: 8 },
  input: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.light, borderRadius: 20, paddingHorizontal: 16, height: 54, gap: 10, borderColor: 'transparent' },
  textInput: { flex: 1, fontSize: 16, color: C.text },
  error: { color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  box: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' },
  checkText: { flex: 1, color: C.text, fontSize: 14 },
  btn: { flexDirection: 'row', backgroundColor: C.green, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 3 },
  btnText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  logoWrap: { width: 90, height: 90, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  logo: { width: 68, height: 68, borderRadius: 20, backgroundColor: C.dark, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: C.dark, marginTop: 14 },
  subtitle: { fontSize: 16, color: C.text, textAlign: 'center', marginTop: 6 },
  social: { flex: 1, flexDirection: 'row', height: 52, borderRadius: 18, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center', gap: 8 },
  socialText: { fontWeight: '600', fontSize: 16 },
});
