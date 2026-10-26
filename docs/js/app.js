import { Router } from './router.js';
import { CatalogPage } from './pages/catalog.js';
import { ProductPage } from './pages/product.js';
import { CartPage } from './pages/cart-page.js';
import { AboutPage } from './pages/about.js';
import { createCartDrawer } from './components/cart-drawer.js';
import { addToCart, clearCart, getCartCount, removeFromCart, setFilter, setQuantity, subscribe } from './store.js';
import { initBackground } from './canvas.js';
import { BASE } from './config.js';

const app = document.querySelector('#app');
const cartCountEl = document.querySelector('[data-cart-count]');
const toastEl = document.querySelector('[data-toast]');

initBackground(document.querySelector('#hero-canvas'));
document.querySelector('[data-year]').textContent = String(new Date().getFullYear());

// ссылки шапки с учётом базового пути (GitHub Pages)
document.querySelectorAll('[data-route]').forEach((anchor) => {
  anchor.href = `${BASE}${anchor.dataset.route}`;
});

let toastTimer = null;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
}

const drawer = createCartDrawer({
  root: document,
  onCheckout: () => {
    showToast('Заказ оформлен! Спасибо 🌿');
    clearCart();
  },
});

subscribe((state) => {
  const count = getCartCount();
  cartCountEl.textContent = String(count);
  if (count > 0) {
    cartCountEl.classList.remove('is-pop');
    // перезапуск анимации счётчика
    void cartCountEl.offsetWidth;
    cartCountEl.classList.add('is-pop');
  }
  drawer.render();
});

const router = new Router({
  container: app,
  routes: [
    { path: '/', render: CatalogPage },
    { path: '/product/:id', render: ProductPage },
    { path: '/cart', render: CartPage },
    { path: '/about', render: AboutPage },
  ],
});

router.start();

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add]');
  if (addButton) {
    addToCart(addButton.dataset.add);
    addButton.classList.add('is-added');
    addButton.textContent = 'Добавлено';
    setTimeout(() => {
      addButton.classList.remove('is-added');
      addButton.textContent = 'В корзину';
    }, 1400);
    showToast('Товар добавлен в корзину');
    return;
  }

  const buyNow = event.target.closest('[data-buy-now]');
  if (buyNow) {
    addToCart(buyNow.dataset.buyNow);
    router.navigate('/cart');
    return;
  }

  const qtyButton = event.target.closest('[data-qty]');
  if (qtyButton) {
    const id = qtyButton.dataset.qty;
    const delta = Number(qtyButton.dataset.delta);
    const items = JSON.parse(localStorage.getItem('garden-store:cart:v1') || '{}');
    const next = (items[id] || 0) + delta;
    setQuantity(id, next);
    return;
  }

  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) {
    removeFromCart(removeButton.dataset.remove);
    showToast('Товар удалён');
    return;
  }

  const categoryButton = event.target.closest('[data-category]');
  if (categoryButton) {
    setFilter({ category: categoryButton.dataset.category });
    router.render('/');
    return;
  }

  const openCart = event.target.closest('[data-open-cart]');
  if (openCart) {
    drawer.open();
    return;
  }

  const historyButton = event.target.closest('[data-history]');
  if (historyButton) {
    if (historyButton.dataset.history === 'back') history.back();
    else history.forward();
  }
});

window.addEventListener('load', () => {
  console.info(
    '%cСад и Огород',
    'background:#2f7d4f;color:#fff;padding:2px 8px;border-radius:6px',
    '\nРоутинг на History API: history.pushState / popstate.\nКорзина: localStorage + Web Worker для скидок.\nАнимации: Canvas + requestAnimationFrame.',
  );
});
