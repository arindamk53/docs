/* =====================================================
   particles.js
   Hero canvas particle system — amber embers drifting up,
   linked by faint amber lines, gentle mouse repulsion.
   Disabled below 768px and on prefers-reduced-motion.
   ===================================================== */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Bail if user prefers reduced motion or on small screens.
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReduced || window.innerWidth < 768) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  const COLORS = ['#F5A623', '#E8520A', '#FFF3CC'];
  const PARTICLE_COUNT = 80;
  const CONNECTION_DISTANCE = 120;
  const REPULSION_RADIUS = 80;
  const REPULSION_STRENGTH = 0.6;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let mouse = { x: null, y: null };
  let rafId = null;
  let running = true;

  function sizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle() {
    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.8, -0.3),     // drift upward
      r: rand(1, 3),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: rand(0.2, 0.6),
      offset: rand(0, Math.PI * 2)
    };
  }

  function init() {
    sizeCanvas();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function update(time) {
    for (const p of particles) {
      // upward drift + gentle horizontal sine sway
      p.x += p.vx + Math.sin(time * 0.001 + p.offset) * 0.3;
      p.y += p.vy;

      // mouse repulsion
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REPULSION_RADIUS && dist > 0) {
          const force = (1 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // wrap edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = rand(0, width);
      }
      if (p.y > height + 20) p.y = -10;
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECTION_DISTANCE) {
          const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;
          ctx.strokeStyle = 'rgba(245, 166, 35, ' + alpha.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(time) {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    update(time);
    drawConnections();
    drawParticles();
    rafId = requestAnimationFrame(frame);
  }

  // === Events ===
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth < 768) {
        running = false;
        cancelAnimationFrame(rafId);
        canvas.style.display = 'none';
        return;
      }
      sizeCanvas();
    }, 150);
  });

  // Mouse repulsion (only when over hero)
  const hero = canvas.parentElement;
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
  }

  // Pause when tab is hidden — saves CPU/battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(rafId);
    } else if (window.innerWidth >= 768 && !prefersReduced) {
      running = true;
      rafId = requestAnimationFrame(frame);
    }
  });

  // Boot
  init();
  rafId = requestAnimationFrame(frame);
})();
