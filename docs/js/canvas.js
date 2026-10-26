

export function initBackground(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let rafId = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  }

  function createParticles() {
    const count = Math.max(24, Math.round((width * height) / 42000));
    particles = Array.from({ length: count }, () => spawnParticle(true));
  }

  function spawnParticle(initial = false) {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 20,
      radius: 1.2 + Math.random() * 2.6,
      speed: 0.15 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.35,
      alpha: 0.18 + Math.random() * 0.35,
      hue: 100 + Math.random() * 45,
    };
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift + Math.sin((p.y + p.radius) / 90) * 0.25;
      if (p.y < -20) Object.assign(p, spawnParticle(false));
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 45%, 45%, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    rafId = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);

  // стартовые растения, чтобы сцена не была пустой
  window.setTimeout(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight - 26;
    [0.14, 0.3, 0.46, 0.62, 0.78, 0.9].forEach((ratio, index) => {
      plant(w * ratio, h - (index % 2) * 6, 60 + Math.random() * 90);
    });
  }, 120);

  rafId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
  };
}

export function initGardenStage(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  const plants = [];
  const MAX_PLANTS = 26;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function plant(x, y, initialHeight = null) {
    if (plants.length >= MAX_PLANTS) plants.shift();
    const target = 80 + Math.random() * 110;
    plants.push({
      x,
      y,
      height: initialHeight ?? 0,
      target,
      hue: 95 + Math.random() * 60,
      sway: Math.random() * Math.PI * 2,
      petals: 3 + Math.floor(Math.random() * 4),
    });
  }

  function frame(time) {
    ctx.clearRect(0, 0, width, height);

    // «Земля» с пологим холмом
    const groundY = height - 34;
    const groundGradient = ctx.createLinearGradient(0, groundY - 60, 0, height);
    groundGradient.addColorStop(0, 'rgba(122, 168, 132, 0.05)');
    groundGradient.addColorStop(0.45, 'rgba(122, 168, 132, 0.18)');
    groundGradient.addColorStop(1, 'rgba(96, 138, 108, 0.32)');
    ctx.beginPath();
    ctx.moveTo(0, groundY + 26);
    ctx.quadraticCurveTo(width * 0.35, groundY - 22, width * 0.62, groundY + 6);
    ctx.quadraticCurveTo(width * 0.85, groundY + 26, width, groundY + 2);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = groundGradient;
    ctx.fill();

    for (const p of plants) {
      // рост
      p.height += (p.target - p.height) * 0.05;
      const sway = Math.sin(time / 900 + p.sway) * 6;

      // стебель
      ctx.beginPath();
      ctx.strokeStyle = `hsl(${p.hue}, 42%, 34%)`;
      ctx.lineWidth = 2.4;
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + sway * 0.5, p.y - p.height * 0.6, p.x + sway, p.y - p.height);
      ctx.stroke();

      // цветок
      const headX = p.x + sway;
      const headY = p.y - p.height;
      for (let i = 0; i < p.petals; i += 1) {
        const angle = (Math.PI * 2 * i) / p.petals;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue + 120}, 65%, 62%, 0.85)`;
        ctx.ellipse(
          headX + Math.cos(angle) * 7,
          headY + Math.sin(angle) * 7,
          6,
          3.4,
          angle,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.beginPath();
      ctx.fillStyle = `hsl(45, 80%, 60%)`;
      ctx.arc(headX, headY, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(frame);
  }

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    plant(event.clientX - rect.left, rect.bottom - rect.top - 26);
  });

  resize();
  window.addEventListener('resize', resize);

  // стартовые растения, чтобы сцена не была пустой
  window.setTimeout(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight - 26;
    [0.14, 0.3, 0.46, 0.62, 0.78, 0.9].forEach((ratio, index) => {
      plant(w * ratio, h - (index % 2) * 6, 60 + Math.random() * 90);
    });
  }, 120);

  rafId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
  };
}
