

import { PRODUCTS } from './data.js';

const STORAGE_KEY = 'garden-store:cart:v1';

const state = {
  cart: loadCart(), // { [productId]: quantity }
  filter: { category: 'all', query: '' },
  lastAdded: null,
};

const listeners = new Set();

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (error) {
    console.warn('Не удалось прочитать корзину из localStorage', error);
    return {};
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  } catch (error) {
    console.warn('Не удалось сохранить корзину', error);
  }
}

function notify() {
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export function getState() {
  return state;
}

export function addToCart(productId, quantity = 1) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;
  state.cart[productId] = (state.cart[productId] || 0) + quantity;
  state.lastAdded = { id: productId, title: product.title };
  persist();
  notify();
}

export function setQuantity(productId, quantity) {
  if (quantity <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = quantity;
  }
  persist();
  notify();
}

export function removeFromCart(productId) {
  delete state.cart[productId];
  persist();
  notify();
}

export function clearCart() {
  state.cart = {};
  persist();
  notify();
}

export function getCartItems() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return null;
      return { ...product, quantity, lineTotal: product.price * quantity };
    })
    .filter(Boolean);
}

export function getCartCount() {
  return Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
}

export function setFilter(patch) {
  state.filter = { ...state.filter, ...patch };
  notify();
}

export function getFilteredProducts() {
  const { category, query } = state.filter;
  const normalized = query.trim().toLowerCase();
  return PRODUCTS.filter((product) => {
    const byCategory = category === 'all' || product.category === category;
    const byQuery =
      !normalized ||
      product.title.toLowerCase().includes(normalized) ||
      product.short.toLowerCase().includes(normalized);
    return byCategory && byQuery;
  });
}
