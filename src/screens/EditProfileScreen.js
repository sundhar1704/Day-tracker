import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme';
import { PageHeader, Card, Avatar, Btn, Chip } from '../components/UI';
import { useApp } from '../utils/store';
import { choosePhoto } from '../utils/media';

const Label = ({ children }) => <Text style={{ fontSize: 11, fontWeight: '800', color: T.deep, letterSpacing: 0.8, marginBottom: 8, marginTop: 16 }}>{children}</Text>;
const input = (err) => ({ backgroundColor: T.chip2, borderRadius: 16, height: 52, paddingHorizontal: 14, fontSize: 15, color: T.text, borderWidth: err ? 1 : 0, borderColor: '#D32F2F' });
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export default function EditProfileScreen({ nav }) {
  const { profile, saveProfile } = useApp();
  const [f, setF] = useState({ name: profile.name || '', age: profile.age || '', phone: profile.phone || '', gender: profile.gender || '', bio: profile.bio || '' });
  const [photo, setPhoto] = useState(profile.photo);
  const [errors, setErrors] = useState({});
  const set = (k) => (v) => { setF({ ...f, [k]: v }); setErrors({ ...errors, [k]: undefined }); };

  const save = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Enter your full name';
    if (f.age && (!/^\d+$/.test(f.age) || Number(f.age) < 5 || Number(f.age) > 120)) e.age = 'Enter a valid age';
    if (f.phone && !/^[+\d][\d\s()-]{6,}$/.test(f.phone)) e.phone = 'Enter a valid phone number';
    setErrors(e);
    if (Object.keys(e).length) return;
    saveProfile({ ...f, name: f.name.trim(), bio: f.bio.trim(), photo });
    nav.pop();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Edit Profile" onBack={nav.pop} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: T.dark }}>Edit Personal Details</Text>
        <Text style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>Keep your profile fresh and up to date</Text>

        <Card style={{ alignItems: 'center', marginTop: 14, paddingVertical: 22 }}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => choosePhoto(setPhoto)}>
            <View style={{ padding: 4, borderRadius: 56, borderWidth: 3, borderColor: T.mint }}><Avatar size={96} photo={photo} name={f.name} /></View>
            <View style={{ position: 'absolute', right: 2, bottom: 2, width: 32, height: 32, borderRadius: 16, backgroundColor: T.deep, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '800', color: T.dark, marginTop: 10 }}>{f.name || 'Your name'}</Text>
          <Text style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Take a photo or pick one from your gallery</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity onPress={() => choosePhoto(setPhoto)} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: T.chip, paddingHorizontal: 16, height: 38, borderRadius: 99 }}>
              <Ionicons name="cloud-upload-outline" size={16} color={T.deep} /><Text style={{ fontWeight: '700', color: T.deep }}>Upload New</Text>
            </TouchableOpacity>
            {!!photo && (
              <TouchableOpacity onPress={() => setPhoto(null)} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#FFE3E0', paddingHorizontal: 16, height: 38, borderRadius: 99 }}>
                <Ionicons name="trash-outline" size={16} color="#B71C1C" /><Text style={{ fontWeight: '700', color: '#B71C1C' }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        <Card style={{ marginTop: 14, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: T.dark }}>Basic Identity</Text>
            <Chip label="Step 1 of 1" bg={T.chip} />
          </View>
          <Label>FULL LEGAL NAME</Label>
          <TextInput value={f.name} onChangeText={set('name')} placeholder="Alex Morgan" placeholderTextColor={T.muted} style={input(errors.name)} />
          {!!errors.name && <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 6 }}>{errors.name}</Text>}
          <Label>AGE</Label>
          <TextInput value={f.age} onChangeText={set('age')} keyboardType="number-pad" maxLength={3} placeholder="28" placeholderTextColor={T.muted} style={input(errors.age)} />
          {!!errors.age && <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 6 }}>{errors.age}</Text>}
          <Label>MOBILE NUMBER</Label>
          <TextInput value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="+91 98765 43210" placeholderTextColor={T.muted} style={input(errors.phone)} />
          {!!errors.phone && <Text style={{ color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 6 }}>{errors.phone}</Text>}
          <Label>GENDER IDENTITY</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {GENDERS.map((g) => (
              <TouchableOpacity key={g} onPress={() => setF({ ...f, gender: f.gender === g ? '' : g })}
                style={{ paddingHorizontal: 16, height: 38, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: f.gender === g ? T.deep : T.chip2 }}>
                <Text style={{ fontWeight: '700', fontSize: 13, color: f.gender === g ? '#fff' : T.sub }}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Label>PRIMARY EMAIL</Label>
          <View style={[input(), { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <Text style={{ color: T.muted, fontSize: 15, flex: 1 }} numberOfLines={1}>{profile.email}</Text>
            <Chip label="Verified" bg={T.mint} fg={T.deep} />
          </View>
          <Label>BIO & PRODUCTIVITY INTENT</Label>
          <TextInput value={f.bio} onChangeText={set('bio')} multiline maxLength={120} placeholder="Focusing on mindfulness and sustainable daily productivity habits." placeholderTextColor={T.muted}
            style={{ backgroundColor: T.chip2, borderRadius: 16, minHeight: 96, padding: 14, textAlignVertical: 'top', fontSize: 15, color: T.text }} />
          <Text style={{ alignSelf: 'flex-end', fontSize: 11, color: T.muted, marginTop: 4 }}>{f.bio.length}/120</Text>
        </Card>

        <Btn title="Save Personal Details" icon="checkmark-circle" style={{ marginTop: 20 }} onPress={save} />
        <Btn title="Discard Changes" kind="ghost" style={{ marginTop: 6 }} onPress={nav.pop} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
