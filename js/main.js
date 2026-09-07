/* AGENT OUTSOURCE — site interactions */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    // close on link click (mobile)
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // ---- Scroll-reactive header ----
  const header = document.querySelector('.site-header');
  if (header) {
    const setScrolled = () => header.classList.toggle('site-header--scrolled', window.scrollY > 10);
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  // ---- FAQ: single-open accordion ----
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => { if (other !== item) other.open = false; });
      }
    });
  });

  // ---- Newsletter form (front-end stub) ----
  const newsletter = document.querySelector('[data-form="newsletter"]');
  if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = newsletter.querySelector('[data-form-status]');
      if (status) {
        status.textContent = 'Thanks — connect this form to Mailchimp/Beehiiv to start collecting emails.';
        status.style.display = 'block';
      }
    });
  }

  // ---- Animated stat counters ----
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute('data-count-to'));
      const suffix = el.getAttribute('data-suffix') || '';
      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const countIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach((el) => countIo.observe(el));
    } else {
      counters.forEach(animateCount);
    }
  }

  // ---- Contact form ----
  // Submits to our own /api/submit-form serverless function, which stores
  // the entry in Postgres and emails a notification.
  const form = document.querySelector('[data-form="contact"]');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = form.querySelector('[data-form-status]');
      const submitBtn = form.querySelector('button[type="submit"]');

      const showStatus = (text) => {
        if (!status) return;
        status.textContent = text;
        status.style.display = 'block';
      };

      const params = new URLSearchParams(window.location.search);
      const payload = {
        name: form.name?.value || '',
        email: form.email?.value || '',
        company: form.company?.value || '',
        role: form.role?.value || '',
        details: form.details?.value || '',
        pageUrl: window.location.href,
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_term: params.get('utm_term') || '',
        utm_content: params.get('utm_content') || '',
        screenWidth: window.screen?.width || null,
        screenHeight: window.screen?.height || null,
        viewportWidth: window.innerWidth || null,
        viewportHeight: window.innerHeight || null,
        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      };

      if (submitBtn) submitBtn.disabled = true;
      showStatus('Sending…');

      try {
        const res = await fetch('/api/submit-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.ok) {
          form.reset();
          showStatus('Thanks — we got it. We reply within one business day.');
        } else {
          showStatus(data.error || 'Something went wrong. Please email us directly at hello@agentoutsource.com.');
        }
      } catch (err) {
        showStatus('Something went wrong. Please email us directly at hello@agentoutsource.com.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  // ---- Hero cursor glow (desktop only, respects reduced motion) ----
  const hero = document.querySelector('.hero');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (hero && !prefersReduced && !isTouch) {
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'glow-orb glow-orb--purple';
    cursorGlow.style.cssText = 'width:420px;height:420px;opacity:0.5;transition:transform .15s ease-out;will-change:transform;';
    hero.appendChild(cursorGlow);
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left - 210;
      const y = e.clientY - rect.top - 210;
      cursorGlow.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
});
