import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATS } from '../theme';
import { syncNotifications } from './notify';
import { updateAccount } from './storage';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const K = { tasks: 'tm:tasks', cats: 'tm:cats', profile: 'tm:profile', notif: 'tm:notif', ledger: 'tm:ledger' };
export const DEFAULT_NOTIF = { morning: true, smart: true, evening: false, weekend: true, tone: 'cheerful', emoji: true, sound: 'Gentle Chime' };
export const DEFAULT_LEDGER = {
  openings: {}, currency: 'INR', txns: [], refSeq: 8900,
  cats: [
    { id: 'l1', name: 'Shopping', icon: 'bag-handle-outline', type: 'DR' }, { id: 'l2', name: 'Food & Dining', icon: 'restaurant-outline', type: 'DR' },
    { id: 'l3', name: 'Transportation', icon: 'bus-outline', type: 'DR' }, { id: 'l4', name: 'Utilities', icon: 'flash-outline', type: 'DR' },
    { id: 'l5', name: 'Health', icon: 'medkit-outline', type: 'DR' }, { id: 'l6', name: 'Work', icon: 'business-outline', type: 'DR' },
    { id: 'l7', name: 'Other', icon: 'ellipsis-horizontal-circle-outline', type: 'DR' },
    { id: 'l8', name: 'Salary', icon: 'cash-outline', type: 'CR' }, { id: 'l9', name: 'Freelance', icon: 'briefcase-outline', type: 'CR' },
    { id: 'l10', name: 'Business', icon: 'storefront-outline', type: 'CR' }, { id: 'l11', name: 'Gift / Refund', icon: 'gift-outline', type: 'CR' },
    { id: 'l12', name: 'Other Income', icon: 'add-circle-outline', type: 'CR' },
  ],
};
// receipts live in their own keys so the main ledger stays small
export const saveReceipt = (id, uri) => AsyncStorage.setItem('tm:rcpt:' + id, uri).catch(() => {});
export const getReceipt = (id) => AsyncStorage.getItem('tm:rcpt:' + id).catch(() => null);

const save = (k, v) => AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => {});

export function AppProvider({ account, children }) {
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [profile, setProfile] = useState({ name: account.name, email: account.email, age: '', phone: '', gender: '', bio: '', photo: null });
  const [notif, setNotifState] = useState(DEFAULT_NOTIF);
  const [ledger, setLedger] = useState(DEFAULT_LEDGER);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.removeItem('ftf:tasks'); // old sample data from the first build
        const [t, c, p, n, l] = await Promise.all([K.tasks, K.cats, K.profile, K.notif, K.ledger].map((k) => AsyncStorage.getItem(k)));
        if (t) setTasks(JSON.parse(t));
        if (c) setCats(JSON.parse(c).map((x) => (x.id === 'c6' && x.account === undefined ? { ...x, account: true } : x)));
        if (p) setProfile((prev) => ({ ...prev, ...JSON.parse(p), email: account.email }));
        if (n) setNotifState({ ...DEFAULT_NOTIF, ...JSON.parse(n) });
        if (l) {
          const L = JSON.parse(l); // migrate the first single-ledger version into the Finance account (id c6)
          const openings = L.openings || (L.opening != null ? { c6: L.opening } : {});
          const txns = (L.txns || []).map((x) => (x.account ? x : { ...x, account: 'c6' }));
          const { opening, ...rest } = L;
          setLedger({ ...DEFAULT_LEDGER, ...rest, openings, txns });
        }
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) syncNotifications(tasks, notif, profile.name); }, [ready, tasks, notif, profile.name]);

  const commitTasks = (fn) => setTasks((prev) => { const next = fn(prev); save(K.tasks, next); return next; });
  const commitCats = (fn) => setCats((prev) => { const next = fn(prev); save(K.cats, next); return next; });

  const commitLedger = (fn) => setLedger((prev) => { const next = fn(prev); save(K.ledger, next); return next; });

  const value = {
    ready, tasks, cats, profile, notif, ledger,
    addTask: (t) => commitTasks((p) => [...p, { id: String(Date.now()), done: false, doneAt: null, subtasks: [], notes: '', ...t }]),
    updateTask: (id, patch) => commitTasks((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    deleteTask: (id) => commitTasks((p) => p.filter((t) => t.id !== id)),
    toggleTask: (id) => commitTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? Date.now() : null } : t))),
    clearCompleted: () => commitTasks((p) => p.filter((t) => !t.done)),
    addCategory: ({ name, icon, desc, account }) => {
      const n = name.trim();
      if (!n) return 'Enter a category name';
      if (cats.some((c) => c.name.toLowerCase() === n.toLowerCase())) return 'That category already exists';
      commitCats((p) => [...p, { id: 'c' + Date.now(), name: n, icon, desc: (desc || '').trim(), account: !!account }]);
      return null;
    },
    updateCategory: (id, { name, icon, desc, account }) => {
      const n = name.trim();
      if (!n) return 'Enter a category name';
      if (cats.some((c) => c.id !== id && c.name.toLowerCase() === n.toLowerCase())) return 'That category already exists';
      const old = cats.find((c) => c.id === id);
      commitCats((p) => p.map((c) => (c.id === id ? { ...c, name: n, icon, desc: (desc || '').trim(), account: !!account } : c)));
      if (old && old.name !== n) commitTasks((p) => p.map((t) => (t.category === old.name ? { ...t, category: n } : t)));
      return null;
    },
    deleteCategory: (id) => {
      if (cats.length <= 1) return;
      ledger.txns.filter((t) => t.account === id).forEach((t) => AsyncStorage.removeItem('tm:rcpt:' + t.id).catch(() => {}));
      commitLedger((p) => { const o = { ...p.openings }; delete o[id]; return { ...p, openings: o, txns: p.txns.filter((t) => t.account !== id) }; });
      commitCats((p) => p.filter((c) => c.id !== id));
    },
    saveProfile: (patch) => {
      setProfile((prev) => { const next = { ...prev, ...patch }; save(K.profile, next); return next; });
      if (patch.name) updateAccount({ name: patch.name });
    },
    setOpening: (acc, n) => commitLedger((p) => ({ ...p, openings: { ...p.openings, [acc]: n } })),
    setCurrency: (c) => commitLedger((p) => ({ ...p, currency: c })),
    addTxn: (txn, receipt) => {
      const id = 't' + Date.now();
      if (receipt) saveReceipt(id, receipt);
      commitLedger((p) => ({ ...p, refSeq: p.refSeq + 1, txns: [...p.txns, { ...txn, id }] }));
      return id;
    },
    deleteTxn: (id) => { AsyncStorage.removeItem('tm:rcpt:' + id).catch(() => {}); commitLedger((p) => ({ ...p, txns: p.txns.filter((t) => t.id !== id) })); },
    addLedgerCat: ({ name, type }) => {
      const n = name.trim();
      if (!n) return 'Enter a tag name';
      if (ledger.cats.some((c) => c.type === type && c.name.toLowerCase() === n.toLowerCase())) return 'That tag already exists';
      commitLedger((p) => ({ ...p, cats: [...p.cats, { id: 'l' + Date.now(), name: n, icon: 'pricetag-outline', type }] }));
      return null;
    },
    setNotif: (patch) => setNotifState((prev) => { const next = { ...prev, ...patch }; save(K.notif, next); return next; }),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
