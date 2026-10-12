// Stylisee marketing website — shared behaviour for every main page.
// Bump the ?v= value in every page after editing, because .htaccess caches JS for a year.

// Approximate conversions from AUD. Plans are priced and billed in AUD; these are
// indicative only. Update the rates and date together.
const RATES_UPDATED = 'October 2026';
const AUD_RATES = {
  AUD: { rate: 1, symbol: 'A$' },
  NZD: { rate: 1.1, symbol: 'NZ$' },
  USD: { rate: 0.66, symbol: 'US$' },
  GBP: { rate: 0.5, symbol: '£' },
  EUR: { rate: 0.58, symbol: '€' },
  CAD: { rate: 0.91, symbol: 'C$' },
};

// Header: border on scroll and mobile menu
const nav = document.querySelector('.site-nav');
const links = document.querySelector('.nav-links');
const toggle = document.querySelector('.menu-toggle');

function onScroll() {
  nav?.classList.toggle('scrolled', window.scrollY > 12);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

function setMenu(open) {
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  links?.classList.toggle('open', open);
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
links?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
  }
});

// Pricing: monthly/yearly switch and approximate conversion under each AUD price.
// Prices carry data-aud (monthly) and data-aud-yearly (per month, billed yearly).
const currencySelect = document.querySelector('#currency');
const billingButtons = document.querySelectorAll('.billing button');
let billing = 'monthly';

function renderPrices() {
  const code = currencySelect?.value || 'AUD';
  const target = AUD_RATES[code] || AUD_RATES.AUD;
  document.querySelectorAll('[data-aud]').forEach((price) => {
    const aud = Number(billing === 'yearly' ? price.dataset.audYearly : price.dataset.aud);
    price.textContent = `A$${aud}`;
    const note = price.closest('.pricing-card')?.querySelector('.price-approx');
    if (!note) return;
    const convert = (amount) => `${target.symbol}${Math.round(amount * target.rate).toLocaleString('en-AU')} ${code}`;
    if (code === 'AUD') {
      note.textContent = billing === 'yearly'
        ? `A$${(aud * 12).toLocaleString('en-AU')} billed yearly in Australian dollars`
        : 'Billed monthly in Australian dollars';
    } else {
      note.textContent = billing === 'yearly'
        ? `≈ ${convert(aud)} / month · ≈ ${convert(aud * 12)} billed yearly (approx.)`
        : `≈ ${convert(aud)} / month, billed monthly (approx.)`;
    }
  });
  const updated = document.querySelector('[data-rates-updated]');
  if (updated) updated.textContent = RATES_UPDATED;
}

billingButtons.forEach((button) => button.addEventListener('click', () => {
  billing = button.dataset.billing;
  billingButtons.forEach((b) => {
    b.classList.toggle('active', b === button);
    b.setAttribute('aria-pressed', String(b === button));
  });
  renderPrices();
}));

if (currencySelect) {
  let saved = null;
  try { saved = localStorage.getItem('stylisee-currency'); } catch { /* storage unavailable */ }
  if (saved && AUD_RATES[saved]) currencySelect.value = saved;
  currencySelect.addEventListener('change', () => {
    try { localStorage.setItem('stylisee-currency', currencySelect.value); } catch { /* storage unavailable */ }
    renderPrices();
  });
  renderPrices();
}

// Hero carousel: swipe or scroll natively; buttons, dots and keyboard move between slides.
// Autoplays every 6 seconds unless the visitor prefers reduced motion, and pauses on hover,
// focus, touch or the pause button.
document.querySelectorAll('.carousel').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...carousel.querySelectorAll('.slide')];
  const dotsWrap = carousel.querySelector('.carousel-dots');
  const url = carousel.querySelector('.carousel-url');
  const pauseBtn = carousel.querySelector('[data-carousel="pause"]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer = null;
  let userPaused = reduceMotion;
  let hovering = false;

  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show slide ${i + 1}: ${slide.querySelector('strong').textContent}`);
    dot.addEventListener('click', () => { goTo(i); stopForGood(); });
    dotsWrap.append(dot);
    return dot;
  });

  function render(index) {
    current = index;
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== index)));
    if (url) url.textContent = slides[index].dataset.url;
  }

  // While a button-driven scroll animates, ignore the in-between scroll positions so rapid
  // clicks count from the intended slide, not from wherever the animation has reached.
  let settleTimer = null;
  let animating = false;
  function goTo(index) {
    const next = (index + slides.length) % slides.length;
    animating = true;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { animating = false; }, 800);
    track.scrollTo({ left: next * track.clientWidth });
    render(next);
  }
  track.addEventListener('scrollend', () => { clearTimeout(settleTimer); animating = false; });

  function play() {
    clearInterval(timer);
    if (userPaused || hovering) return;
    timer = setInterval(() => goTo(current + 1), 6000);
  }

  function setPaused(paused) {
    userPaused = paused;
    carousel.classList.toggle('paused', paused);
    pauseBtn.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    track.setAttribute('aria-live', paused ? 'polite' : 'off');
    play();
  }

  // Any deliberate interaction stops autoplay so the visitor stays in control.
  function stopForGood() { if (!userPaused) setPaused(true); }

  carousel.querySelector('[data-carousel="prev"]').addEventListener('click', () => { goTo(current - 1); stopForGood(); });
  carousel.querySelector('[data-carousel="next"]').addEventListener('click', () => { goTo(current + 1); stopForGood(); });
  pauseBtn.addEventListener('click', () => setPaused(!userPaused));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { goTo(current + 1); stopForGood(); }
    if (event.key === 'ArrowLeft') { goTo(current - 1); stopForGood(); }
  });
  carousel.addEventListener('mouseenter', () => { hovering = true; play(); });
  carousel.addEventListener('mouseleave', () => { hovering = false; play(); });
  carousel.addEventListener('focusin', () => { hovering = true; play(); });
  carousel.addEventListener('focusout', () => { hovering = false; play(); });
  track.addEventListener('touchstart', stopForGood, { passive: true });

  // Keep dots in sync when the visitor swipes.
  let scrollFrame = null;
  track.addEventListener('scroll', () => {
    if (animating) return;
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      if (index !== current && slides[index]) render(index);
    });
  }, { passive: true });
  window.addEventListener('resize', () => { track.scrollLeft = current * track.clientWidth; });

  render(0);
  setPaused(userPaused);
});

// Contact form: preselect a topic from ?topic= and submit to the cPanel PHP endpoint
const contactForm = document.querySelector('.contact-form form');
const TOPICS = { pricing: 'Plans and billing' };
const topicParam = new URLSearchParams(window.location.search).get('topic');
const subjectSelect = contactForm?.querySelector('#subject');
if (subjectSelect && TOPICS[topicParam]) subjectSelect.value = TOPICS[topicParam];

let contactPending = false;
contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (contactPending) return;
  contactForm.querySelector('.form-error')?.remove();
  const fields = new FormData(contactForm);
  const enquiry = Object.fromEntries(
    ['name', 'email', 'subject', 'message', 'website'].map((key) => [
      key, String(fields.get(key) || '').trim(),
    ]),
  );
  const button = contactForm.querySelector('[type="submit"]');
  const showError = (message) => {
    const alert = document.createElement('div');
    alert.className = 'form-error';
    alert.setAttribute('role', 'alert');
    alert.textContent = message;
    button.before(alert);
  };
  if (!enquiry.name || !enquiry.email || !enquiry.subject || !enquiry.message) {
    showError('Please fill in all required fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
    showError('Please enter a valid email address.');
    return;
  }

  const originalButton = button.innerHTML;
  contactPending = true;
  button.disabled = true;
  button.textContent = 'Sending…';
  contactForm.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(contactForm.getAttribute('action') || '/contact-submit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(enquiry),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) {
      throw new Error(result?.message || 'We could not send your enquiry. Please try again later or email support@stylisee.com directly.');
    }
    const success = document.createElement('div');
    success.className = 'form-success';
    success.setAttribute('role', 'status');
    success.setAttribute('tabindex', '-1');
    const heading = document.createElement('h3');
    heading.textContent = 'Thank you for your enquiry.';
    const message = document.createElement('p');
    message.className = 'body-copy';
    message.textContent = 'We will get back to you within two working days.';
    success.append(heading, message);
    contactForm.replaceWith(success);
    success.focus();
  } catch (error) {
    showError(error.name === 'AbortError'
      ? 'The server took too long to respond. Your enquiry may have been sent; please email support@stylisee.com before trying again.'
      : error instanceof TypeError
        ? 'We could not confirm that your enquiry was sent. Check your connection or email support@stylisee.com directly.'
        : error.message);
  } finally {
    window.clearTimeout(timeout);
    contactPending = false;
    button.disabled = false;
    button.innerHTML = originalButton;
    contactForm.removeAttribute('aria-busy');
  }
});
