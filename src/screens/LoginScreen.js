import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Field, Checkbox, PrimaryButton, Header, SocialButtons, C } from '../components/AuthUI';
import { verifyLogin, saveSession } from '../utils/storage';

export default function LoginScreen({ onLoggedIn, onGoSignup, prefillEmail = '' }) {
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const e = {};
    if (!email.trim()) e.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    const account = await verifyLogin(email, password);
    setLoading(false);
    if (!account) return setErrors({ password: 'Incorrect email or password' });
    if (remember) await saveSession(account.email); // next launch goes straight in
    onLoggedIn(account);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }} keyboardShouldPersistTaps="handled">
      <Header title="Welcome Back" subtitle="Cultivate your daily focus and tasks" />
      <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 20 }}>
        <Field label="EMAIL ADDRESS" icon="mail-outline" value={email} onChangeText={(v) => { setEmail(v); setErrors({ ...errors, email: undefined }); }} placeholder="alex@bloomflow.app" keyboardType="email-address" error={errors.email} />
        <Field label="PASSWORD" icon="lock-closed-outline" secure value={password} onChangeText={(v) => { setPassword(v); setErrors({ ...errors, password: undefined }); }} placeholder="Password" error={errors.password} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Checkbox checked={remember} onPress={() => setRemember(!remember)}>Remember me</Checkbox>
          <Text style={{ color: C.dark, fontWeight: '700' }}>Forgot Password?</Text>
        </View>
        <PrimaryButton title="Log In" onPress={login} loading={loading} />
      </View>
      <Text style={{ textAlign: 'center', color: C.muted, letterSpacing: 1, marginVertical: 20 }}>OR CONTINUE WITH</Text>
      <SocialButtons onPress={(n) => Alert.alert(n, 'Social login needs a backend/OAuth setup.')} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
        <Text style={{ fontSize: 16 }}>Don't have an account? </Text>
        <TouchableOpacity onPress={onGoSignup}><Text style={{ fontSize: 16, fontWeight: '700', color: C.green }}>Sign Up</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}
