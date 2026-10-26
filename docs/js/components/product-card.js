import { link } from '../config.js';
import { ProductIcon } from './icons.js';

/**
 * ProductCard, карточка товара в каталоге.
 * Чистая функция: получает товар, возвращает HTML-строку.
 */

const CATEGORY_TITLES = {
  tools: 'Инструменты',
  plants: 'Растения',
  pots: 'Кашпо',
  care: 'Уход',
};

export function formatPrice(value) {
  return `${value.toLocaleString('ru-RU')} руб.`;
}

export function ProductCard(product) {
  const hasDiscount = Boolean(product.oldPrice);
  return `
    <article class="product-card">
      <a class="product-card__media" href="${link(`/product/${product.id}`)}" data-link aria-label="${product.title}">
        ${hasDiscount ? '<span class="badge product-card__tag">Скидка</span>' : ''}
        <span class="product-card__emoji">${ProductIcon(product.category, { seed: product.id })}</span>
      </a>
      <h3 class="product-card__title">
        <a href="${link(`/product/${product.id}`)}" data-link>${product.title}</a>
      </h3>
      <p class="product-card__meta">${CATEGORY_TITLES[product.category] || ''} · ★ ${product.rating}</p>
      <div class="product-card__foot">
        <div>
          <span class="price">${formatPrice(product.price)}</span>
          ${hasDiscount ? `<span class="price--old">${formatPrice(product.oldPrice)}</span>` : ''}
        </div>
        <button class="product-card__add" type="button" data-add="${product.id}">В корзину</button>
      </div>
    </article>
  `;
}
