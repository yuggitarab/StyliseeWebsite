/* Stylisee Marketing Site — Main JavaScript */
(function () {
  'use strict';

  /* ── Nav scroll shadow ── */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Fade-up on scroll ── */
  if ('IntersectionObserver' in window) {
    const els = document.querySelectorAll('.fade-up');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.fade-up').forEach((el) => el.classList.add('visible'));
  }

  /* ── Contact form ── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const successBlock = document.getElementById('form-success');
    const errorBlock   = document.getElementById('form-error');
    const submitBtn    = document.getElementById('form-submit');

    function setError(msg) {
      if (errorBlock) {
        errorBlock.textContent = msg;
        errorBlock.classList.remove('hidden');
      }
    }
    function clearError() {
      if (errorBlock) { errorBlock.textContent = ''; errorBlock.classList.add('hidden'); }
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError();

      const name    = document.getElementById('f-name').value.trim();
      const email   = document.getElementById('f-email').value.trim();
      const subject = document.getElementById('f-subject').value.trim();
      const message = document.getElementById('f-message').value.trim();

      if (!name || !email || !subject || !message) {
        setError('Please fill in all required fields.');
        return;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      /* Build a mailto link as the no-backend submission approach */
      const body = encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\nSubject: ' + subject + '\n\n' + message
      );
      const mailto = 'mailto:support@stylisee.com?subject=' + encodeURIComponent('[Contact] ' + subject) + '&body=' + body;

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Opening mail client...'; }

      window.location.href = mailto;

      setTimeout(function () {
        contactForm.classList.add('hidden');
        if (successBlock) successBlock.classList.remove('hidden');
      }, 600);
    });
  }

  /* ── Current year in footer ── */
  const yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach((el) => { el.textContent = new Date().getFullYear(); });

})();
