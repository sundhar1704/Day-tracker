export const CURRENCIES = {
  INR: { sym: '₹', label: 'INR (₹)' },
  USD: { sym: '$', label: 'USD ($)' },
  EUR: { sym: '€', label: 'EUR (€)' },
  GBP: { sym: '£', label: 'GBP (£)' },
};

// fmt(-1250.5,'INR') -> "-₹1,250.50" ; sign=true adds "+" for positive numbers
export function fmt(n, cur = 'INR', sign = false) {
  const abs = Math.abs(Number(n) || 0);
  const [i, d] = abs.toFixed(2).split('.');
  let g;
  if (cur === 'INR') { // Indian grouping: 12,34,567
    const last3 = i.slice(-3), rest = i.slice(0, -3);
    g = (rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + last3;
  } else g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const s = n < 0 ? '-' : sign && n > 0 ? '+' : '';
  return `${s}${(CURRENCIES[cur] || CURRENCIES.INR).sym}${g}.${d}`;
}

export const parseAmount = (str) => {
  const v = parseFloat(String(str).replace(/,/g, ''));
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
};
