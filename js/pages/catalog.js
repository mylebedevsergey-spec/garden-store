import { CATEGORIES } from '../data.js';
import { getFilteredProducts, getState, setFilter } from '../store.js';
import { ProductCard } from '../components/product-card.js';
import { initGardenStage } from '../canvas.js';
import { link } from '../config.js';

export function CatalogPage() {
  const { filter } = getState();
  const products = getFilteredProducts();

  const chips = CATEGORIES.map(
    (category) => `
      <button class="chip ${filter.category === category.id ? 'is-active' : ''}"
              type="button" data-category="${category.id}">${category.title}</button>
    `,
  ).join('');

  const cards = products.length
    ? products.map(ProductCard).join('')
    : '<div class="catalog__empty">Ничего не нашлось. Попробуй другой запрос или категорию.</div>';

  return {
    title: 'Каталог',
    html: `
      <div class="page">
        <section class="catalog__hero">
          <div>
            <span class="badge">Сезон 2026</span>
            <h1>Всё для сада и подоконника</h1>
            <p class="catalog__lead">
              Инструменты, растения, кашпо и средства ухода. Доставка по Москве за 1–2 дня,
              самовывоз из пункта на Садовой, бесплатно.
            </p>
            <a class="button button--primary" href="${link('/cart')}" data-link>Перейти в корзину</a>
          </div>
          <div class="catalog__hero-card">
            <strong>12</strong>
            <p class="muted">товаров в каталоге</p>
            <strong>1–2 дня</strong>
            <p class="muted">среднее время доставки</p>
          </div>
        </section>

        <div class="canvas-panel">
          <canvas class="canvas-panel__stage" data-garden-stage aria-label="Интерактивная сцена: нажмите, чтобы посадить растение"></canvas>
          <p class="canvas-panel__hint">Нажми на поле, посади растение (Canvas API)</p>
        </div>

        <div class="catalog__filters">
          ${chips}
          <input class="catalog__search" type="search" placeholder="Поиск по каталогу" data-search
                 value="${filter.query.replace(/"/g, '&quot;')}" aria-label="Поиск по каталогу" />
        </div>

        <div class="catalog__grid" data-grid>${cards}</div>
      </div>
    `,
    mount(root) {
      const canvas = root.querySelector('[data-garden-stage]');
      const cleanupCanvas = initGardenStage(canvas);

      const search = root.querySelector('[data-search]');
      let timer = null;
      const onInput = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setFilter({ query: search.value });
          const grid = root.querySelector('[data-grid]');
          const list = getFilteredProducts();
          grid.innerHTML = list.length
            ? list.map(ProductCard).join('')
            : '<div class="catalog__empty">Ничего не нашлось.</div>';
        }, 180);
      };
      search.addEventListener('input', onInput);

      return () => {
        clearTimeout(timer);
        search.removeEventListener('input', onInput);
        cleanupCanvas?.();
      };
    },
  };
}
