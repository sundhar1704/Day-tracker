import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../theme';
import Logo from '../components/Logo';

const STEPS = ['Syncing Calendar...', 'Loading your tasks...', 'Preparing categories...', 'Setting up reminders...', 'Almost ready...'];

export default function SplashScreen({ duration, onDone }) {
  const [pct, setPct] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true }));
    const b = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]));
    a.start(); b.start();
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - start) / duration) * 100));
      setPct(p);
      if (p >= 100) { clearInterval(id); setTimeout(onDone, 250); }
    }, 100);
    return () => { clearInterval(id); a.stop(); b.stop(); };
  }, []);

  const rot = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotBack = spin.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length))];

  return (
    <LinearGradient colors={['#B5F5B0', '#D3FBCE', '#FFFFFF']} style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ marginTop: 80, fontSize: 20, color: T.dark, textAlign: 'center', paddingHorizontal: 50, lineHeight: 28 }}>Organize your day, conquer your goals.</Text>
      <View style={{ marginTop: 100, alignItems: 'center', justifyContent: 'center', width: 240, height: 240 }}>
        <Animated.View style={{ position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1.5, borderStyle: 'dashed', borderColor: T.deep, transform: [{ rotate: rot }] }} />
        <Animated.View style={{ position: 'absolute', width: 214, height: 214, borderRadius: 107, borderWidth: 1, borderStyle: 'dashed', borderColor: '#5E9A66', transform: [{ rotate: rotBack }] }} />
        <Animated.View style={{ width: 176, height: 176, borderRadius: 88, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
          <Logo size={112} />
        </Animated.View>
      </View>
      <Text style={{ marginTop: 36, fontSize: 28, fontWeight: '800', color: T.dark }}>TaskMaster •</Text>
      <Text style={{ marginTop: 6, fontSize: 11, letterSpacing: 3, color: T.sub, fontWeight: '600' }}>DAILY FOCUS & ROUTINES</Text>
      <View style={{ position: 'absolute', bottom: 70, left: 30, right: 30 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontWeight: '700', color: T.dark, fontSize: 13 }}>● {step}</Text>
          <Text style={{ fontWeight: '700', color: T.dark, fontSize: 13 }}>{pct}%</Text>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(0,69,13,0.15)', overflow: 'hidden' }}>
          <View style={{ height: 6, width: `${pct}%`, backgroundColor: T.dark }} />
        </View>
      </View>
    </LinearGradient>
  );
}
