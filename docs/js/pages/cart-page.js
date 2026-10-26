import { getCartCount, getCartItems } from '../store.js';
import { formatPrice } from '../components/product-card.js';
import { ProductIcon } from '../components/icons.js';
import { link } from '../config.js';

export function CartPage() {
  const items = getCartItems();

  if (!items.length) {
    return {
      title: 'Корзина',
      html: `
        <div class="page">
          <h1>Корзина пуста</h1>
          <p class="muted">Добавьте товары из каталога, и они появятся здесь.</p>
          <a class="button button--primary" href="${link('/')}" data-link>В каталог</a>
        </div>
      `,
    };
  }

  const rows = items
    .map(
      (item) => `
      <div class="cart-item">
        <div class="cart-item__thumb">${ProductIcon(item.category, { seed: item.id })}</div>
        <div>
          <div class="cart-item__title">${item.title}</div>
          <div class="cart-item__price">${formatPrice(item.price)} × ${item.quantity} = ${formatPrice(item.lineTotal)}</div>
        </div>
        <div class="cart-item__counter">
          <button class="cart-item__btn" type="button" data-qty="${item.id}" data-delta="-1" aria-label="Убрать одну штуку">−</button>
          <span>${item.quantity}</span>
          <button class="cart-item__btn" type="button" data-qty="${item.id}" data-delta="1" aria-label="Добавить одну штуку">+</button>
          <button class="cart-item__remove" type="button" data-remove="${item.id}">Удалить</button>
        </div>
      </div>
    `,
    )
    .join('');

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    title: 'Корзина',
    html: `
      <div class="page">
        <h1>Корзина</h1>
        <p class="muted">Товаров: ${getCartCount()} · сумма без скидки: ${formatPrice(total)}</p>
        <div class="info-card" style="max-width:none">
          ${rows}
          <p class="muted" style="margin-top:16px">Итог со скидкой считается в отдельном потоке (Web Worker), смотрите панель корзины справа.</p>
        </div>
      </div>
    `,
  };
}
