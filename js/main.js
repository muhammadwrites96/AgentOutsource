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

  // ---- Contact form (front-end stub) ----
  // Replace the endpoint below with a real handler:
  //  - Formspree / Basin / Netlify Forms for email
  //  - or your own API route
  const form = document.querySelector('[data-form="contact"]');
  if (form) {
    form.addEventListener('submit', (e) => {
      // If no real endpoint is set yet, prevent submit and show a message.
      if (!form.getAttribute('action') || form.getAttribute('action') === '#') {
        e.preventDefault();
        const status = form.querySelector('[data-form-status]');
        if (status) {
          status.textContent = 'Form endpoint not connected yet. Add your Formspree/Netlify action in the HTML.';
          status.style.display = 'block';
        }
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
