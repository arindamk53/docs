/* =====================================================
   main.js
   Boot file — nav scroll behaviour, mobile drawer,
   ScrollSpy, contact form validation, Lucide icons,
   small UX glue.
   ===================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initLucide();
    initNav();
    initMobileDrawer();
    initScrollSpy();
    initContactForm();
    initFooterYear();
  });

  /* === Render Lucide icons === */
  function initLucide() {
    function go() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
    if (window.lucide) {
      go();
    } else {
      // Lucide is deferred — wait briefly
      let tries = 0;
      const t = setInterval(() => {
        tries += 1;
        if (window.lucide || tries > 40) {
          clearInterval(t);
          go();
        }
      }, 50);
    }
  }

  /* === Sticky/transparent nav transition === */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 80) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* === Mobile drawer (right-side off-canvas) === */
  function initMobileDrawer() {
    const toggle = document.querySelector('.nav__toggle');
    const drawer = document.querySelector('.nav__drawer');
    const overlay = document.querySelector('.nav__overlay');
    if (!toggle || !drawer || !overlay) return;

    function open() {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      if (drawer.classList.contains('is-open')) close();
      else open();
    });
    overlay.addEventListener('click', close);
    drawer.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', close)
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Close drawer if resized to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) close();
    });
  }

  /* === ScrollSpy: highlight nav link of section in view === */
  function initScrollSpy() {
    const links = document.querySelectorAll('.nav__menu .nav__link[href^="#"], .nav__drawer .nav__link[href^="#"]');
    if (!links.length) return;

    const map = new Map(); // section id -> array of links
    links.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const list = map.get(id) || [];
      list.push(link);
      map.set(id, list);
    });

    const sections = Array.from(map.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const linksForId = map.get(id) || [];
          if (entry.isIntersecting) {
            // remove active from all, then activate matching
            links.forEach((l) => l.classList.remove('is-active'));
            linksForId.forEach((l) => l.classList.add('is-active'));
          }
        });
      },
      {
        // The section that occupies the middle band of the viewport wins
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0
      }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* === Custom contact form validation (amber styles) === */
  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const status = form.querySelector('.form-status');
    const fields = form.querySelectorAll('input, select, textarea');

    function showError(field, message) {
      field.classList.add('field-error');
      let msg = field.parentElement.querySelector('.field-error-msg');
      if (!msg) {
        msg = document.createElement('span');
        msg.className = 'field-error-msg';
        field.insertAdjacentElement('afterend', msg);
      }
      msg.textContent = message;
    }
    function clearError(field) {
      field.classList.remove('field-error');
      const msg = field.parentElement.querySelector('.field-error-msg');
      if (msg) msg.remove();
    }

    fields.forEach((field) => {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('blur', () => validateField(field));
    });

    function validateField(field) {
      const v = field.value.trim();
      if (field.required && !v) {
        showError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && v) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (!ok) {
          showError(field, 'Enter a valid email address.');
          return false;
        }
      }
      if (field.type === 'tel' && v) {
        const ok = /^[\d\s+\-()]{7,}$/.test(v);
        if (!ok) {
          showError(field, 'Enter a valid phone number.');
          return false;
        }
      }
      clearError(field);
      return true;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      fields.forEach((f) => {
        if (!validateField(f)) valid = false;
      });
      if (!valid) {
        if (status) {
          status.textContent = 'Please correct the highlighted fields.';
          status.classList.add('is-error');
          status.classList.remove('is-success');
        }
        return;
      }

      const action = form.getAttribute('action') || '';
      const usingFormspree = action && !action.includes('YOUR_FORM_ID');

      if (status) {
        status.textContent = 'Sending your enquiry…';
        status.classList.remove('is-error', 'is-success');
      }

      if (!usingFormspree) {
        // Demo mode — pretend success.
        setTimeout(() => {
          if (status) {
            status.textContent =
              'Thanks! Your enquiry has been recorded. We will reach out shortly.';
            status.classList.add('is-success');
          }
          form.reset();
        }, 600);
        return;
      }

      try {
        const data = new FormData(form);
        const res = await fetch(action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          if (status) {
            status.textContent =
              'Thanks! Your enquiry has been sent. We will be in touch soon.';
            status.classList.add('is-success');
          }
          form.reset();
        } else {
          throw new Error('Network error');
        }
      } catch (err) {
        if (status) {
          status.textContent =
            'Something went wrong. Please call +91 95474 88969.';
          status.classList.add('is-error');
        }
      }
    });
  }

  /* === Footer year === */
  function initFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }
})();
