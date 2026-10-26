import { getCartItems, getCartCount } from '../store.js';
import { formatPrice } from './product-card.js';
import { ProductIcon } from './icons.js';

export function createCartDrawer({ root, onCheckout }) {
  const drawer = root.querySelector('[data-cart-drawer]');
  const body = drawer.querySelector('[data-cart-body]');
  const subtotalEl = drawer.querySelector('[data-cart-subtotal]');
  const discountEl = drawer.querySelector('[data-cart-discount]');
  const totalEl = drawer.querySelector('[data-cart-total]');
  const noteEl = drawer.querySelector('[data-cart-note]');

  let worker = null;
  try {
    worker = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' });
    worker.addEventListener('error', (event) => {
      console.warn('Web Worker упал, считаем локально', event.message || event);
      worker.terminate();
      worker = null;
      render();
    });
    worker.addEventListener('message', (event) => {
      const { type, subtotal, discount, total, note } = event.data || {};
      if (type !== 'result') return;
      subtotalEl.textContent = formatPrice(subtotal);
      discountEl.textContent = discount ? `−${formatPrice(discount)}` : '0 руб.';
      totalEl.textContent = formatPrice(total);
      noteEl.textContent = note;
    });
  } catch (error) {
    console.warn('Web Worker недоступен, считаем локально', error);
  }

  function localFallback(items) {
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const percent = subtotal >= 10000 ? 15 : subtotal >= 5000 ? 10 : 0;
    const discount = Math.round((subtotal * percent) / 100);
    subtotalEl.textContent = formatPrice(subtotal);
    discountEl.textContent = discount ? `−${formatPrice(discount)}` : '0 руб.';
    totalEl.textContent = formatPrice(subtotal - discount);
    noteEl.textContent = percent
      ? `Скидка ${percent}% применена`
      : 'Скидка 10% от 5 000 руб., 15% от 10 000 руб.';
  }

  function open() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.querySelector('.cart-drawer__panel')?.focus();
  }

  function close() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  function render() {
    const items = getCartItems();

    if (!items.length) {
      body.innerHTML = '<div class="cart-empty">Пока пусто. Добавьте что-нибудь из каталога 🌱</div>';
    } else {
      body.innerHTML = items
        .map(
          (item) => `
          <div class="cart-item">
            <div class="cart-item__thumb">${ProductIcon(item.category, { seed: item.id })}</div>
            <div>
              <div class="cart-item__title">${item.title}</div>
              <div class="cart-item__price">${formatPrice(item.price)} · ${item.quantity} шт.</div>
            </div>
            <div class="cart-item__counter">
              <button class="cart-item__btn" type="button" data-qty="${item.id}" data-delta="-1" aria-label="Убрать одну штуку">−</button>
              <span>${item.quantity}</span>
              <button class="cart-item__btn" type="button" data-qty="${item.id}" data-delta="1" aria-label="Добавить одну штуку">+</button>
            </div>
          </div>
        `,
        )
        .join('');
    }

    const payload = items.map((item) => ({ price: item.price, quantity: item.quantity }));

    if (worker) worker.postMessage({ type: 'calc', items: payload });
    else localFallback(items);

    if (!items.length) {
      subtotalEl.textContent = '0 руб.';
      discountEl.textContent = '0 руб.';
      totalEl.textContent = '0 руб.';
    }
  }

  drawer.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-cart]')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  drawer.querySelector('[data-checkout]')?.addEventListener('click', () => {
    if (!getCartCount()) return;
    close();
    onCheckout?.();
  });

  return { open, close, render, destroy: () => worker?.terminate() };
}
