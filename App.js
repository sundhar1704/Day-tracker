import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SplashScreen from './src/screens/SplashScreen';
import TodayScreen from './src/screens/TodayScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import LedgerScreen from './src/screens/LedgerScreen';
import LogTransactionScreen from './src/screens/LogTransactionScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import CompletedScreen from './src/screens/CompletedScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { BottomNav, Fab } from './src/components/UI';
import { AppProvider } from './src/utils/store';
import { getAccount, getSessionAccount, clearSession } from './src/utils/storage';
import { T, LOAD_MS } from './src/theme';

function Main({ onLogout }) {
  const [tab, setTab] = useState('Today');
  const [stack, setStack] = useState([]);
  const nav = {
    tab,
    push: (name, params = {}) => setStack((s) => [...s, { name, params }]),
    pop: () => setStack((s) => s.slice(0, -1)),
    go: (t) => { setStack([]); setTab(t); },
  };

  // Android back button
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length) { setStack((s) => s.slice(0, -1)); return true; }
      if (tab !== 'Today') { setTab('Today'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [stack, tab]);

  const top = stack[stack.length - 1];
  const showNav = !top || ['Profile', 'TaskDetail', 'Ledger'].includes(top.name);
  let body;
  if (top) {
    const p = top.params;
    switch (top.name) {
      case 'AddTask': body = <AddTaskScreen nav={nav} task={p.task} presetDate={p.presetDate} />; break;
      case 'TaskDetail': body = <TaskDetailScreen nav={nav} id={p.id} />; break;
      case 'Profile': body = <ProfileScreen nav={nav} onLogout={onLogout} />; break;
      case 'EditProfile': body = <EditProfileScreen nav={nav} />; break;
      case 'Ledger': body = <LedgerScreen nav={nav} accountId={p.id} />; break;
      case 'LogTransaction': body = <LogTransactionScreen nav={nav} accountId={p.accountId} />; break;
      case 'Notifications': body = <NotificationsScreen nav={nav} />; break;
      default: body = null;
    }
  } else {
    body = tab === 'Today' ? <TodayScreen nav={nav} />
      : tab === 'Calendar' ? <CalendarScreen nav={nav} />
      : tab === 'Categories' ? <CategoriesScreen nav={nav} />
      : tab === 'Analytics' ? <AnalyticsScreen nav={nav} />
      : <CompletedScreen nav={nav} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {body}
        {!top && (tab === 'Today' || tab === 'Calendar') && <Fab onPress={() => nav.push('AddTask')} />}
      </View>
      {showNav && <BottomNav active={tab} onChange={nav.go} />}
    </View>
  );
}

export default function App() {
  const [phase, setPhase] = useState('boot'); // boot | auth | loading | app
  const [authScreen, setAuthScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const session = await getSessionAccount();
      if (session) { setUser(session); return setPhase('loading'); } // already has an account -> straight in
      const account = await getAccount();
      if (account) { setEmail(account.email); setAuthScreen('login'); } else setAuthScreen('signup');
      setPhase('auth');
    })();
  }, []);

  const enter = (a) => { setUser(a); setPhase('loading'); };
  const logout = async () => { await clearSession(); setUser(null); setAuthScreen('login'); setPhase('auth'); };

  let body;
  if (phase === 'boot') body = <ActivityIndicator style={{ flex: 1 }} color={T.primary} size="large" />;
  else if (phase === 'auth')
    body = authScreen === 'signup'
      ? <SignupScreen onEnter={enter} onGoLogin={() => setAuthScreen('login')} />
      : <LoginScreen prefillEmail={email} onLoggedIn={enter} onGoSignup={() => setAuthScreen('signup')} />;
  else
    body = (
      <AppProvider account={user}>
        {phase === 'loading' ? <SplashScreen duration={LOAD_MS} onDone={() => setPhase('app')} /> : <Main onLogout={logout} />}
      </AppProvider>
    );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F0FFF4', '#E3F8E7', '#F4FFF6']} style={{ flex: 1 }}>
        {phase === 'loading' ? body : <SafeAreaView style={{ flex: 1 }}>{body}</SafeAreaView>}
      </LinearGradient>
    </SafeAreaProvider>
  );
}
