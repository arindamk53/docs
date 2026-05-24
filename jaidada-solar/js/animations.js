/* =====================================================
   animations.js
   GSAP load sequence + ScrollTrigger reveals.
   Falls back gracefully when GSAP isn't loaded.
   Disabled below 768px and on prefers-reduced-motion.
   ===================================================== */

(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js-loaded'); // enable .reveal pre-state

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const isMobile = window.innerWidth < 768;

  // Safety net: if GSAP fails to load OR we shouldn't animate,
  // make every .reveal element instantly visible.
  function showAllReveals() {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.hero-eyebrow, .hero-line-1, .hero-line-2, .hero-line-3, .hero-subline, .hero-cta-row, .hero-trust-strip').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  // Wait for libs (deferred). We poll briefly because scripts are deferred.
  function whenReady(cb, attempts = 40) {
    if (window.gsap && window.ScrollTrigger) return cb();
    if (attempts <= 0) return showAllReveals();
    setTimeout(() => whenReady(cb, attempts - 1), 50);
  }

  // Bail early on reduced motion: just show everything.
  if (prefersReduced) {
    showAllReveals();
    return;
  }

  whenReady(() => {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // === Hero load sequence ===
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.from('.nav', { y: -20, opacity: 0, duration: 0.5, delay: 0.1 })
      .from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.5 }, '-=0.2')
      .from('.hero-line-1', { y: 40, opacity: 0, duration: 0.6 }, '-=0.2')
      .from('.hero-line-2', { y: 40, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-line-3', { y: 40, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-subline', { y: 20, opacity: 0, duration: 0.5 }, '-=0.2')
      .from('.hero-cta-row', { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.hero-trust-strip', { y: 10, opacity: 0, duration: 0.4 }, '-=0.3');

    // === If on mobile, no scroll-triggered reveals — just show content ===
    if (isMobile) {
      showAllReveals();
      return;
    }

    // === Standard reveals ===
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.fromTo(
        el,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // === Stagger card grids ===
    gsap.utils.toArray('.card-grid, .service-grid, .stats-grid, .process__list').forEach((grid) => {
      const cards = grid.querySelectorAll(
        '.service-card, .team-card, .why-card, .stat-card, .process-step'
      );
      if (!cards.length) return;
      gsap.fromTo(
        cards,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: grid,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // === VanillaTilt on service cards ===
    if (window.VanillaTilt) {
      const cards = document.querySelectorAll('.service-card');
      if (cards.length) {
        window.VanillaTilt.init(cards, {
          max: 6,
          speed: 400,
          glare: true,
          'max-glare': 0.15,
          gyroscope: false
        });
      }
    }

    // Refresh once images settle
    window.addEventListener('load', () => ScrollTrigger.refresh());
  });
})();
