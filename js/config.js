

const baseEl = document.querySelector('base');
export const BASE = (baseEl?.getAttribute('href') || '/')
  .replace(/\/+$/, '')
  .replace(/^\.$/, '');

/** Построить внутреннюю ссылку с учётом базового пути. */
export const link = (path) => `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
