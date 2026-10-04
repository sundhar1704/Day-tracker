import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const ACCOUNT_KEY = 'ftf:account';
const SESSION_KEY = 'ftf:session';

// Never store the raw password – store a salted SHA-256 hash.
const hash = (email, password) =>
  Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${email.toLowerCase()}::${password}`
  );

export async function getAccount() {
  const raw = await AsyncStorage.getItem(ACCOUNT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function createAccount({ name, email, password }) {
  const account = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hash(email.trim(), password),
  };
  await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  return account;
}

export async function verifyLogin(email, password) {
  const account = await getAccount();
  if (!account) return null;
  const h = await hash(email.trim(), password);
  return account.email === email.trim().toLowerCase() && account.passwordHash === h
    ? account
    : null;
}

export const saveSession = (email) => AsyncStorage.setItem(SESSION_KEY, email);
export const clearSession = () => AsyncStorage.removeItem(SESSION_KEY);
export async function getSessionAccount() {
  const email = await AsyncStorage.getItem(SESSION_KEY);
  const account = await getAccount();
  return email && account && account.email === email ? account : null;
}

// Update saved account details (name only – email stays the login id)
export async function updateAccount(patch) {
  const account = await getAccount();
  if (!account) return null;
  const next = { ...account, ...patch };
  await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
  return next;
}
