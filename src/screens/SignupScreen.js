import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Field, Checkbox, PrimaryButton, Header, SocialButtons, strength, C } from '../components/AuthUI';
import { createAccount, getAccount, saveSession } from '../utils/storage';

export default function SignupScreen({ onEnter, onGoLogin }) {
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null); // set after account is created -> shows "Tap to Enter"
  const set = (k) => (v) => { setF({ ...f, [k]: v }); if (errors[k]) setErrors({ ...errors, [k]: undefined }); };
  const level = strength(f.password);

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Full name is required';
    else if (f.name.trim().length < 2) e.name = 'Enter at least 2 characters';
    if (!f.email.trim()) e.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address';
    if (!f.password) e.password = 'Password is required';
    else if (f.password.length < 8) e.password = 'At least 8 characters';
    else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = 'Use letters and numbers';
    if (!f.confirm) e.confirm = 'Please confirm your password';
    else if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
    if (!agree) e.agree = 'Please accept the Terms of Service and Privacy Policy';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    const existing = await getAccount();
    if (existing && existing.email === f.email.trim().toLowerCase()) {
      setLoading(false);
      return setErrors({ email: 'An account with this email already exists. Please log in.' });
    }
    const account = await createAccount(f);
    setLoading(false);
    setCreated(account);
  };

  const enter = async () => { await saveSession(created.email); onEnter(created); };

  if (created)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="checkmark-circle" size={64} color={C.green} />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: C.dark, marginTop: 20 }}>Account Created!</Text>
        <Text style={{ fontSize: 16, color: C.text, textAlign: 'center', marginTop: 8, marginBottom: 32 }}>
          Welcome, {created.name.split(' ')[0]}. Your account is ready.
        </Text>
        <View style={{ alignSelf: 'stretch' }}><PrimaryButton title="Tap to Enter" onPress={enter} /></View>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 50 }} keyboardShouldPersistTaps="handled">
      <Header title="Create Account" subtitle="Start organizing your day and conquering goals with clarity." />
      <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 20 }}>
        <Field label="FULL NAME" icon="person-outline" value={f.name} onChangeText={set('name')} placeholder="Alex Morgan" error={errors.name} />
        <Field label="EMAIL ADDRESS" icon="mail-outline" value={f.email} onChangeText={set('email')} placeholder="alex@domain.com" keyboardType="email-address" error={errors.email} />
        <Field label="PASSWORD" icon="lock-closed-outline" secure value={f.password} onChangeText={set('password')} placeholder="At least 8 characters" error={errors.password} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: -8, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ width: 28, height: 6, borderRadius: 3, backgroundColor: i <= level ? C.green : '#DCE8DF' }} />
            ))}
          </View>
          <Text style={{ color: C.muted, fontSize: 12 }}>Password strength</Text>
        </View>
        <Field label="CONFIRM PASSWORD" icon="refresh-outline" secure value={f.confirm} onChangeText={set('confirm')} placeholder="Re-enter password" error={errors.confirm} />
        <Checkbox checked={agree} onPress={() => { setAgree(!agree); setErrors({ ...errors, agree: undefined }); }}>
          I agree to the <Text style={{ fontWeight: '700', color: C.dark }}>Terms of Service</Text> and <Text style={{ fontWeight: '700', color: C.dark }}>Privacy Policy</Text>.
        </Checkbox>
        {!!errors.agree && <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: -8, marginBottom: 12, marginLeft: 4 }}>{errors.agree}</Text>}
        <PrimaryButton title="Create Account" onPress={submit} loading={loading} />
        <Text style={{ textAlign: 'center', color: C.muted, letterSpacing: 1, marginVertical: 16 }}>OR CONTINUE WITH</Text>
        <SocialButtons onPress={(n) => Alert.alert(n, 'Social login needs a backend/OAuth setup.')} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
        <Text style={{ fontSize: 16 }}>Already have an account? </Text>
        <TouchableOpacity onPress={onGoLogin}><Text style={{ fontSize: 16, fontWeight: '700', color: C.green }}>Log In</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}
