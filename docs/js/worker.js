

const DISCOUNT_RULES = [
  { from: 10000, percent: 15 },
  { from: 5000, percent: 10 },
];

function calcTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Имитация «тяжёлого» расчёта: подбираем лучшую скидку по порогам.
  let best = { percent: 0, rule: null };
  for (const rule of DISCOUNT_RULES) {
    if (subtotal >= rule.from && rule.percent > best.percent) {
      best = { percent: rule.percent, rule };
    }
  }

  const discount = Math.round((subtotal * best.percent) / 100);
  const total = subtotal - discount;

  const note = best.rule
    ? `Скидка ${best.percent}% применена: сумма от ${best.rule.from.toLocaleString('ru-RU')} руб.`
    : 'Скидка 10% от 5 000 руб., 15% от 10 000 руб.';

  return { subtotal, discount, total, note };
}

/** Демонстрация «тяжёлых» вычислений: количество простых чисел до N. */
function countPrimes(limit) {
  const n = Math.max(0, Math.min(5_000_000, Math.floor(Number(limit) || 0)));
  const sieve = new Uint8Array(n + 1);
  let count = 0;
  for (let i = 2; i <= n; i += 1) {
    if (sieve[i]) continue;
    count += 1;
    for (let j = i * i; j <= n; j += i) sieve[j] = 1;
  }
  return { count, limit: n };
}

self.addEventListener('message', (event) => {
  const { type, items, n } = event.data || {};

  if (type === 'calc') {
    const safeItems = Array.isArray(items) ? items : [];
    self.postMessage({ type: 'result', ...calcTotals(safeItems) });
    return;
  }

  if (type === 'compute') {
    const started = performance.now();
    const { count, limit } = countPrimes(n);
    const ms = Math.round(performance.now() - started);
    self.postMessage({ type: 'computed', count, limit, ms });
  }
});
