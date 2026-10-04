export const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfWeek = (d) => { const x = startOfDay(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }; // Monday
export const fmtTime = (d) => { let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${pad(h)}:${pad(d.getMinutes())} ${ap}`; };
export const parseTime = (s) => {
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(s || '');
  if (!m) return { h: 9, m: 0 };
  let h = Number(m[1]) % 12; if (m[3].toUpperCase() === 'PM') h += 12;
  return { h, m: Number(m[2]) };
};
export const dueDate = (t) => { const d = parseKey(t.date); const { h, m } = parseTime(t.time); d.setHours(h, m, 0, 0); return d; };
export const timeMinutes = (t) => { const { h, m } = parseTime(t.time); return h * 60 + m; };
export const fmtLong = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
export const fmtShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const byTime = (a, b) => timeMinutes(a) - timeMinutes(b);
