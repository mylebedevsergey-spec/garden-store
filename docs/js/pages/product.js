import { getProduct } from '../data.js';
import { formatPrice } from '../components/product-card.js';
import { link } from '../config.js';
import { ProductIcon } from '../components/icons.js';

export function ProductPage({ id }) {
  const product = getProduct(id);

  if (!product) {
    return {
      title: 'Товар не найден',
      html: `
        <div class="page">
          <div class="info-card">
            <h1>Товар не найден</h1>
            <p class="muted">Возможно, ссылка устарела.</p>
            <a class="button button--primary" href="${link('/')}" data-link>Вернуться в каталог</a>
          </div>
        </div>
      `,
    };
  }

  const specs = product.specs
    .map(([key, value]) => `<li><span class="muted">${key}</span><strong>${value}</strong></li>`)
    .join('');

  return {
    title: product.title,
    html: `
      <div class="page">
        <a class="product__back" href="${link('/')}" data-link>← Назад в каталог</a>
        <div class="product">
          <div class="product__media">
            <span class="product__shine" aria-hidden="true"></span>
            <span class="product__emoji">${ProductIcon(product.category, { seed: product.id })}</span>
          </div>
          <div class="product__info">
            <h1>${product.title}</h1>
            <p class="muted">★ ${product.rating} · в наличии</p>
            <div class="product__price-row">
              <span class="price">${formatPrice(product.price)}</span>
              ${product.oldPrice ? `<span class="price--old">${formatPrice(product.oldPrice)}</span>` : ''}
            </div>
            <p>${product.description}</p>
            <ul class="product__specs">${specs}</ul>
            <div class="product__actions">
              <button class="button button--primary" type="button" data-add="${product.id}">Добавить в корзину</button>
              <button class="button button--ghost" type="button" data-buy-now="${product.id}">Купить сейчас</button>
            </div>
          </div>
        </div>
      </div>
    `,
  };
}
