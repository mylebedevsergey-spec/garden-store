import { BASE } from './config.js';

export class Router {
  constructor({ routes, container, onRender }) {
    this.routes = routes;
    this.container = container;
    this.onRender = onRender;
    this.currentCleanup = null;
    // Позиция в истории: pushState кладёт свой номер в history.state,
    // поэтому «Вперёд» можно включать только когда мы не в конце стека.
    this.index = 0;
    this.maxIndex = 0;
  }

  start() {
    this.initHistoryIndex();
    document.addEventListener('click', (event) => this.handleLinkClick(event));
    window.addEventListener('popstate', (event) => {
      const idx = event.state?.idx;
      if (typeof idx === 'number') this.index = idx;
      this.maxIndex = Math.max(this.maxIndex, this.index);
      this.render(this.currentPath(), { fromHistory: true });
    });
    this.render(this.currentPath(), { fromHistory: true });
  }

  initHistoryIndex() {
    const state = history.state;
    if (state && typeof state.idx === 'number') {
      this.index = state.idx;
      this.maxIndex = state.idx;
    } else {
      history.replaceState({ ...(state || {}), path: this.currentPath(), idx: 0 }, '');
    }
  }

  currentPath() {
    const path = location.pathname.slice(BASE.length) || '/';
    return path.startsWith('/') ? path : `/${path}`;
  }

  handleLinkClick(event) {
    const link = event.target.closest('a[data-link]');
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    const url = new URL(link.href, location.origin);
    if (url.origin !== location.origin) return;

    // href уже содержит базовый путь (/garden-store/…), срезаем его,
    // navigate() добавит BASE сам, иначе адрес удвоится.
    let path = url.pathname;
    if (BASE && path.startsWith(`${BASE}/`)) path = path.slice(BASE.length);
    else if (BASE && path === BASE) path = '/';

    event.preventDefault();
    this.navigate(path + url.search);
  }

  navigate(path, { replace = false } = {}) {
    const full = `${BASE}${path}`;
    if (full === location.pathname + location.search) return;
    if (!replace) this.index += 1;
    const state = { path, scrollY: window.scrollY, idx: this.index };
    if (replace) history.replaceState(state, '', full);
    else history.pushState(state, '', full);
    this.maxIndex = this.index;
    this.render(path);
  }

  match(path) {
    for (const route of this.routes) {
      const keys = [];
      const pattern = route.path
        .split('/')
        .map((segment) => {
          if (!segment.startsWith(':')) return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          keys.push(segment.slice(1));
          return '([^/]+)';
        })
        .join('/');
      const regex = new RegExp(`^${pattern}/?$`);
      const match = path.match(regex);
      if (match) {
        const params = Object.fromEntries(keys.map((key, index) => [key, decodeURIComponent(match[index + 1])]));
        return { route, params };
      }
    }
    return null;
  }

  async render(path, { fromHistory = false } = {}) {
    const matched = this.match(path) || this.match('/');
    const { route, params } = matched;

    if (typeof this.currentCleanup === 'function') {
      this.currentCleanup();
      this.currentCleanup = null;
    }

    const result = route.render(params);
    this.container.innerHTML = result.html;
    document.title = result.title ? `${result.title}, Сад и Огород` : 'Сад и Огород';

    this.container.querySelector('.page')?.classList.add('page');
    this.updateActiveLink(path);
    this.updateHistoryButtons();

    if (typeof result.mount === 'function') {
      this.currentCleanup = result.mount(this.container);
    }

    if (typeof this.onRender === 'function') this.onRender({ path, result });

    if (fromHistory && history.state && typeof history.state.scrollY === 'number') {
      window.scrollTo({ top: history.state.scrollY, behavior: 'instant' in window ? 'instant' : 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateActiveLink(path) {
    document.querySelectorAll('.header__link').forEach((link) => {
      let href = new URL(link.href, location.origin).pathname;
      if (BASE && href.startsWith(`${BASE}/`)) href = href.slice(BASE.length);
      const isActive = href === '/' ? path === '/' : path.startsWith(href);
      link.classList.toggle('is-active', isActive);
    });
  }

  updateHistoryButtons() {
    const back = document.querySelector('[data-history="back"]');
    const forward = document.querySelector('[data-history="forward"]');
    if (back) back.disabled = this.index <= 0;
    if (forward) forward.disabled = this.index >= this.maxIndex;
  }
}
