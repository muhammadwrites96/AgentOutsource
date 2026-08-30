/* AGENT OUTSOURCE — site interactions */

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
});
