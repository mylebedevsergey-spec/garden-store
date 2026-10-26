export function AboutPage() {
  return {
    title: 'О магазине',
    html: `
      <div class="page">
        <h1>О магазине</h1>
        <div class="info-card">
          <p>
            «Сад и Огород», учебный интернет-магазин садовых принадлежностей. Проект сделан как
            практическая работа: в нём показаны вёрстка, адаптивная сетка, анимации,
            клиентский роутинг и работа с HTML5 API.
          </p>
          <h3>Что внутри</h3>
          <ul>
            <li>каталог из 12 товаров с фильтрами по категориям и поиском;</li>
            <li>страница товара с характеристиками и анимацией;</li>
            <li>корзина с сохранением в localStorage и пересчётом скидок в Web Worker;</li>
            <li>навигация на History API: ссылки, «Назад/Вперёд», восстановление скролла;</li>
            <li>интерактивная сцена на Canvas: клик сажает растение, анимация через requestAnimationFrame.</li>
          </ul>
          <h3>Проверка Web Worker</h3>
          <p class="muted">
            Введите число N, воркер посчитает количество простых чисел до N в фоновом потоке,
            не блокируя анимацию на странице.
          </p>
          <div class="worker-demo">
            <input class="worker-demo__input" type="number" min="10" max="5000000" step="1000"
                   value="1000000" data-worker-input aria-label="Предел вычисления" />
            <button class="button button--primary" type="button" data-worker-run>Посчитать в воркере</button>
            <span class="worker-demo__status" data-worker-status role="status">Готово к запуску</span>
          </div>

          <div class="info-grid">
            <div class="info-tile"><strong>HTML/CSS</strong>Grid, Flexbox, CSS-переменные, 3D-трансформации, keyframes</div>
            <div class="info-tile"><strong>JavaScript</strong>Модули ES, стор с подпиской, делегирование событий</div>
            <div class="info-tile"><strong>HTML5 API</strong>History API, Canvas, Web Worker, localStorage</div>
          </div>
        </div>
      </div>
    `,
    mount(root) {
      const input = root.querySelector('[data-worker-input]');
      const button = root.querySelector('[data-worker-run]');
      const status = root.querySelector('[data-worker-status]');
      let worker = null;

      try { worker = new Worker(new URL('../worker.js', import.meta.url), { type: 'module' }); } catch (error) { worker = null; }

      if (!worker) {
        status.textContent = 'Web Worker недоступен в этом браузере';
        return () => {};
      }

      const onMessage = (event) => {
        const { type, count, limit, ms } = event.data || {};
        if (type !== 'computed') return;
        status.textContent = `Простых чисел до ${limit.toLocaleString('ru-RU')}: ${count.toLocaleString('ru-RU')} · ${ms} мс (фоновый поток)`;
        button.disabled = false;
        button.textContent = 'Посчитать в воркере';
      };
      const onError = (event) => {
        status.textContent = `Ошибка воркера: ${event.message || 'неизвестная'}`;
        button.disabled = false;
        button.textContent = 'Посчитать в воркере';
      };

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);

      const onClick = () => {
        const value = Number(input.value);
        if (!Number.isFinite(value) || value < 2) {
          status.textContent = 'Введите число больше 2';
          return;
        }
        button.disabled = true;
        button.textContent = 'Считаю…';
        status.textContent = 'Вычисление в фоновом потоке…';
        worker.postMessage({ type: 'compute', n: value });
      };
      button.addEventListener('click', onClick);

      return () => {
        button.removeEventListener('click', onClick);
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        worker.terminate();
      };
    },
  };
}
