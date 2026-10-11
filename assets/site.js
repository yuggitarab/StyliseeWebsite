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

// Pricing: approximate conversion shown under each AUD price
const currencySelect = document.querySelector('#currency');

function showConversions(code) {
  const target = AUD_RATES[code] || AUD_RATES.AUD;
  document.querySelectorAll('[data-aud]').forEach((price) => {
    const note = price.closest('.pricing-card, .price-teaser')?.querySelector('.price-approx');
    if (!note) return;
    if (code === 'AUD') {
      note.textContent = 'Billed in Australian dollars';
      return;
    }
    const converted = Math.round(Number(price.dataset.aud) * target.rate);
    note.textContent = `≈ ${target.symbol}${converted} ${code} / month (approx.)`;
  });
  const updated = document.querySelector('[data-rates-updated]');
  if (updated) updated.textContent = RATES_UPDATED;
}

if (currencySelect) {
  let saved = null;
  try { saved = localStorage.getItem('stylisee-currency'); } catch { /* storage unavailable */ }
  if (saved && AUD_RATES[saved]) currencySelect.value = saved;
  currencySelect.addEventListener('change', () => {
    try { localStorage.setItem('stylisee-currency', currencySelect.value); } catch { /* storage unavailable */ }
    showConversions(currencySelect.value);
  });
  showConversions(currencySelect.value);
}

// Contact form: preselect a topic from ?topic= and submit to the cPanel PHP endpoint
const contactForm = document.querySelector('.contact-form form');
const TOPICS = { pilot: 'Join the pilot programme', pricing: 'Plans and billing' };
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
