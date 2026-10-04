// ⏱ Loading animation shown after you enter the app. 10000 = 10 sec, 20000 = 20 sec.
export const LOAD_MS = 10000;

export const T = {
  bg: '#F0FDF1', primary: '#126D27', dark: '#00450D', deep: '#1B5E20', chip: '#DFECE0',
  chip2: '#E4F1E5', mint: '#9CF49C', text: '#131E17', muted: '#717A6D', sub: '#41493E',
  redBg: '#FFDAD6', red: '#93000A', white: '#fff',
};
export const shadow = { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 };

export const CAT_ICONS = ['briefcase-outline', 'person-outline', 'bag-handle-outline', 'book-outline', 'leaf-outline', 'wallet-outline',
  'cart-outline', 'fitness-outline', 'home-outline', 'airplane-outline', 'heart-outline', 'code-slash-outline', 'musical-notes-outline', 'paw-outline'];

export const DEFAULT_CATS = [
  { id: 'c1', name: 'Work', icon: 'briefcase-outline', desc: 'Projects & meetings' },
  { id: 'c2', name: 'Personal', icon: 'person-outline', desc: 'Daily life' },
  { id: 'c3', name: 'Errands', icon: 'bag-handle-outline', desc: 'Shopping & chores' },
  { id: 'c4', name: 'Study', icon: 'book-outline', desc: 'Learning goals' },
  { id: 'c5', name: 'Health', icon: 'leaf-outline', desc: 'Wellness & fitness' },
  { id: 'c6', name: 'Finance', icon: 'wallet-outline', desc: 'Balance, income & spending', account: true },
];

const PAL = [['#DFF5E1', '#1B5E20'], ['#DCEBFA', '#0D47A1'], ['#FFF1D6', '#8A5A00'], ['#F6E1F5', '#7B1FA2'], ['#E0F5F3', '#00695C'], ['#FFE3E0', '#B71C1C']];
export function catColor(name = '') {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  const [bg, fg] = PAL[h % PAL.length];
  return { bg, fg };
}
