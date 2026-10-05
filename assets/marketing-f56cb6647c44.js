const {plans,faqs}={"plans":[{"name":"Essential","description":"The calm centre for a growing independent practice.","monthly":19,"yearly":15,"features":["Client profiles & notes","Booking calendar","Service catalogue","Email support"]},{"name":"Professional","description":"A complete studio system for an established practice.","monthly":39,"yearly":31,"featured":true,"features":["Everything in Essential","Style & colour profiling","Client portals","Revenue insights","Custom branding"]},{"name":"Studio","description":"More room for a team, multiple services, and bigger ideas.","monthly":69,"yearly":55,"features":["Everything in Professional","Team access","Advanced analytics","Priority support","Brand collaboration tools"]}],"faqs":[{"q":"Can I try Stylisee before I commit?","a":"Yes. Every plan begins with a 14-day free trial, with no credit card required. Explore the workspace, add your services, and see how it fits your practice."},{"q":"Can I change plans later?","a":"Absolutely. Your practice changes as it grows, and your plan can change with it. Upgrade or move down at any time from your account."},{"q":"Is there a contract?","a":"No long-term contracts. Stylisee is billed monthly or annually, and you can cancel whenever you choose."},{"q":"Does Stylisee work for colour analysis?","a":"Yes. Style profiling is designed to capture colour seasons, tones, preferences, risk responses, and the details that make your methodology yours."}]};
const nav=document.querySelector('.site-nav'),links=document.querySelector('.nav-links'),toggle=document.querySelector('.menu-toggle');
function onScroll(){nav?.classList.toggle('scrolled',window.scrollY>12)}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('menu-open',open);links.classList.toggle('open',open)});
links?.addEventListener('click',e=>{if(e.target.closest('a')){links.classList.remove('open');nav.classList.remove('menu-open');toggle?.setAttribute('aria-expanded','false')}});
document.querySelectorAll('.billing button').forEach((button,index)=>button.addEventListener('click',()=>{document.querySelectorAll('.billing button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index))});document.querySelectorAll('.pricing-card .price').forEach((price,i)=>{price.textContent='$'+(index?plans[i].yearly:plans[i].monthly)})}));
document.querySelectorAll('.faq-question').forEach((button,index)=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';document.querySelectorAll('.faq-question').forEach(b=>{b.setAttribute('aria-expanded','false');b.classList.remove('open');b.parentElement.querySelector('.faq-answer')?.remove()});if(open){button.setAttribute('aria-expanded','true');button.classList.add('open');const answer=document.createElement('div');answer.className='faq-answer';answer.textContent=faqs[index].a;button.parentElement.appendChild(answer)}}));
// Included in the standalone marketing runtime by export-cpanel.mjs.
const contactForm = document.querySelector('.contact-form form');
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
  const showError = (message) => {
    const alert = document.createElement('div');
    alert.className = 'form-error';
    alert.setAttribute('role', 'alert');
    alert.textContent = message;
    contactForm.querySelector('[type="submit"]').before(alert);
  };
  if (!enquiry.name || !enquiry.email || !enquiry.subject || !enquiry.message) {
    showError('Please fill in all required fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
    showError('Please enter a valid email address.');
    return;
  }

  const button = contactForm.querySelector('[type="submit"]');
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
