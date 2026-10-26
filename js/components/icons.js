const PALETTE = {
  tools: ['#e7f0e3', '#c9dfc3', '#2f7d4f'],
  plants: ['#e6f4e4', '#bfe3bd', '#28723f'],
  pots: ['#f6ecdf', '#e5d2b8', '#a9763f'],
  care: ['#e3f0f2', '#bcdde3', '#2b7c85'],
};

/** Лист, растения. */
function leafIcon(color) {
  return `<path d="M28 76C28 46 46 28 76 28c0 30-18 48-48 48Z" fill="${color}" opacity=".9"/>
    <path d="M30 74c14-2 30-14 42-30" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
}

/** Секатор, инструменты. */
function toolIcon(color) {
  return `<path d="M34 28 68 66" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
    <path d="M66 28 32 66" stroke="${color}" stroke-width="7" stroke-linecap="round" opacity=".75"/>
    <circle cx="30" cy="70" r="9" fill="none" stroke="${color}" stroke-width="5"/>
    <circle cx="70" cy="70" r="9" fill="none" stroke="${color}" stroke-width="5"/>`;
}

/** Кашпо, горшки. */
function potIcon(color) {
  return `<path d="M32 44h36l-5 32a6 6 0 0 1-6 5H43a6 6 0 0 1-6-5l-5-32Z" fill="${color}" opacity=".9"/>
    <path d="M28 36h44" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
    <path d="M50 36V22" stroke="${color}" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    <path d="M50 24c8-2 12-8 12-14-8 0-12 6-12 14Z" fill="${color}" opacity=".65"/>`;
}

/** Капля, уход. */
function careIcon(color) {
  return `<path d="M50 22c12 16 20 26 20 36a20 20 0 0 1-40 0c0-10 8-20 20-36Z" fill="${color}" opacity=".9"/>
    <path d="M42 58a9 9 0 0 0 8 9" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".65"/>`;
}

const ICONS = { tools: toolIcon, plants: leafIcon, pots: potIcon, care: careIcon };

export function ProductIcon(category, { className = '', seed = '' } = {}) {
  const shift = seed ? [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 40 : 0;
  const [from, to, ink] = PALETTE[category] || PALETTE.plants;
  const id = `g-${category}-${Math.random().toString(36).slice(2, 7)}`;
  const draw = ICONS[category] || leafIcon;
  return `
    <svg class="${className}" viewBox="0 0 100 100" role="img" aria-hidden="true" focusable="false" style="filter:hue-rotate(${shift}deg)">
      <defs>
        <radialGradient id="${id}" cx="30%" cy="25%" r="80%">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="48" fill="url(#${id})"/>
      <g>${draw(ink)}</g>
    </svg>
  `;
}

/** Маленький лист для логотипа. */
export function LeafMark(className = '') {
  return `<svg class="${className}" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
    <path d="M4 20C4 11 10 5 20 4c0 9-6 16-16 16Z" fill="#2f7d4f"/>
    <path d="M6 18C9 13 13 9 18 6" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>
  </svg>`;
}
