/* =====================================================
   counter.js
   Animated stat counters via IntersectionObserver.
   Custom JS implementation (no CountUp.js dependency).
   ===================================================== */

(function () {
  'use strict';

  const els = document.querySelectorAll('.stat-number');
  if (!els.length) return;

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function setFinal(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    el.textContent = target + '+';
  }

  if (prefersReduced) {
    els.forEach(setFinal);
    return;
  }

  function animateCounter(el, target, duration = 2500) {
    const start = performance.now();
    function step(time) {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      el.textContent = Math.floor(eased * target) + '+';
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + '+';
    }
    requestAnimationFrame(step);
  }

  const section = document.querySelector('.stats-section');
  if (!section) {
    els.forEach(setFinal);
    return;
  }

  // IntersectionObserver fallback if not supported
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) =>
      animateCounter(el, parseInt(el.dataset.target, 10) || 0)
    );
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          els.forEach((el) =>
            animateCounter(el, parseInt(el.dataset.target, 10) || 0)
          );
          observer.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(section);
})();
