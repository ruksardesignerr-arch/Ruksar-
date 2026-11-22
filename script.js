(() => {
  'use strict';

  /* Set your WhatsApp number: country code + number, digits only (e.g. "919XXXXXXXXX") */
  const WHATSAPP_NUMBER = '9170160 24565 ';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Missing photos stay as clean gradient placeholders (no broken-image icons) */
  $$('img').forEach(img => {
    const hide = () => img.classList.add('is-missing');
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* Navbar */
  const nav = $('#nav'), btn = $('#menuBtn'), links = $('#navLinks');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  const setMenu = open => {
    links.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  btn.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  document.addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });
  addEventListener('resize', () => innerWidth >= 1024 && setMenu(false));

  /* Smooth anchor scrolling; cards/links can preselect the mehndi type */
  const typeSelect = $('#typeSelect');
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (a.dataset.type) typeSelect.value = a.dataset.type;
    if (a.hasAttribute('data-wa') || id === '#') { e.preventDefault(); if (a.hasAttribute('data-wa')) openWhatsApp('Hello! I would like to know more about your mehndi services.'); return; }
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView();
    history.replaceState(null, '', id);
    setMenu(false);
  }));

  /* Reveal on scroll */
  const items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, o) => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });
  } else items.forEach(el => el.classList.add('in'));

  /* WhatsApp */
  function openWhatsApp(text) {
    if (!WHATSAPP_NUMBER) { alert('WhatsApp number is not set yet. Add it to WHATSAPP_NUMBER in script.js.'); return; }
    open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }

  /* Booking form */
  const form = $('#bookingForm');
  form.date.min = new Date().toISOString().split('T')[0];
  const rules = {
    name: v => v.trim().length >= 2 || 'Please enter your name',
    phone: v => /^[+]?[\d\s-]{7,15}$/.test(v.trim()) || 'Enter a valid phone number',
    date: v => !!v || 'Please choose your event date'
  };
  const check = el => {
    const res = rules[el.name](el.value), f = el.closest('.field');
    f.classList.toggle('invalid', res !== true);
    $('.err', f).textContent = res === true ? '' : res;
    return res === true;
  };
  const inputs = ['name', 'phone', 'date'].map(n => form[n]);
  inputs.forEach(el => {
    el.addEventListener('blur', () => check(el));
    el.addEventListener('input', () => el.closest('.field').classList.contains('invalid') && check(el));
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = inputs.map(check).every(Boolean);
    if (!ok) return inputs.find(i => i.closest('.field').classList.contains('invalid')).focus();
    const d = new Date(form.date.value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    openWhatsApp([
      'Hello! I would like to book a mehndi session.', '',
      `*Name:* ${form.name.value.trim()}`,
      `*Phone:* ${form.phone.value.trim()}`,
      `*Event Date:* ${d}`,
      `*Mehndi Type:* ${form.type.value}`, '',
      'Please confirm availability. Thank you!'
    ].join('\n'));
  });
})();
