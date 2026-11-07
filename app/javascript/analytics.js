// One consent-gated Google tag; never collect form values or arbitrary link text.
const preferenceKey = 'bp-analytics-consent-v1';
const preferenceLifetime = 183 * 24 * 60 * 60 * 1000;
const deniedAds = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
let consent;
let started = false;
let lastViewedBody;
let menuObserver;
let lastMenuPage;

function measurementId() {
  const id = document.querySelector('meta[name="bp-ga4-id"]')?.content;
  return /^G-[A-Z0-9]+$/.test(id || '') ? id : null;
}

function readPreference() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(preferenceKey));
    if (saved && ['granted', 'denied'].includes(saved.value) && saved.expires > Date.now()) return saved.value;
  } catch (_) { /* Private browsing can make storage unavailable. */ }
  return undefined;
}

function safeLocation(value, campaigns = false) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    const clean = new URL(url.origin + url.pathname);
    if (campaigns) {
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content', 'gclid', 'dclid', 'gbraid', 'wbraid'].forEach((key) => {
        const item = url.searchParams.get(key);
        if (item) clean.searchParams.set(key, item.slice(0, 150));
      });
    }
    return clean.href;
  } catch (_) { return ''; }
}

function track(name, parameters = {}) {
  if (consent !== 'granted' || !started || !measurementId()) return;
  window.gtag('event', name, { ...parameters, send_to: measurementId() });
}

function pageView() {
  if (consent !== 'granted' || lastViewedBody === document.body) return;
  lastViewedBody = document.body;
  const page = {
    page_title: document.title,
    page_location: safeLocation(window.location.href, true),
    page_referrer: safeLocation(document.referrer)
  };
  window.gtag('set', page);
  track('page_view', page);
}

function startAnalytics() {
  const id = measurementId();
  if (!id || consent !== 'granted') return;
  window[`ga-disable-${id}`] = false;
  if (!started) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ...deniedAds, analytics_storage: 'denied' });
    // Cover automatic destination configuration as well as our explicit config.
    window.gtag('set', 'send_page_view', false);
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('consent', 'update', { ...deniedAds, analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: 'SameSite=Lax;Secure',
      cookie_expires: 33696000,
      page_location: safeLocation(window.location.href, true),
      page_referrer: safeLocation(document.referrer)
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.dataset.bpGoogleTag = '1';
    document.head.append(script);
    started = true;
  } else {
    window.gtag('consent', 'update', { ...deniedAds, analytics_storage: 'granted' });
  }
  pageView();
}

function clearAnalyticsCookies() {
  const domains = window.location.hostname.split('.');
  const scopes = [''];
  for (let i = 0; i < domains.length - 1; i += 1) scopes.push(`;domain=${domains.slice(i).join('.')}`, `;domain=.${domains.slice(i).join('.')}`);
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (!/^_ga(?:_|$)/.test(name)) return;
    scopes.forEach((scope) => { document.cookie = `${name}=;max-age=0;path=/${scope};SameSite=Lax;Secure`; });
  });
}

function updateConsentUI() {
  const banner = document.querySelector('[data-bp-consent-banner]');
  if (banner) banner.hidden = consent !== undefined;
  const status = document.querySelector('[data-bp-consent-status]');
  if (status) status.textContent = consent === 'granted' ? 'Your choice: analytics allowed.' : consent === 'denied' ? 'Your choice: analytics declined.' : 'Analytics is off until you allow it.';
}

function applyConsent(value) {
  consent = value;
  if (value === 'granted') startAnalytics();
  else {
    const id = measurementId();
    if (id) window[`ga-disable-${id}`] = true;
    if (started) window.gtag('consent', 'update', { ...deniedAds, analytics_storage: 'denied' });
    clearAnalyticsCookies();
    lastViewedBody = undefined;
  }
  updateConsentUI();
}

function saveConsent(value) {
  try { window.localStorage.setItem(preferenceKey, JSON.stringify({ value, expires: Date.now() + preferenceLifetime })); } catch (_) { /* Keep the choice for this page if storage is blocked. */ }
  applyConsent(value);
  document.getElementById('bp-analytics-notice')?.close();
}

function menuPageView() {
  const dialog = document.querySelector('[data-bp-menu]');
  if (!dialog?.open || consent !== 'granted') return;
  const leaves = [...dialog.querySelectorAll('[data-bp-menu-leaf]')];
  const index = leaves.findIndex((leaf) => !leaf.inert);
  if (index < 0 || index === lastMenuPage) return;
  lastMenuPage = index;
  track('menu_page_view', { menu_page: index + 1, menu_section: ['starters_sushi', 'steak_seafood', 'dessert_after_dinner'][index] || 'back_cover' });
}

function initAnalytics() {
  if (!measurementId()) return;
  if (consent === undefined) consent = readPreference();
  updateConsentUI();
  if (consent === 'granted') startAnalytics();
  menuObserver?.disconnect();
  const menu = document.querySelector('[data-bp-menu]');
  if (menu) {
    menuObserver = new MutationObserver(menuPageView);
    menuObserver.observe(menu, { attributes: true, subtree: true, attributeFilter: ['inert'] });
  }
}

document.addEventListener('click', (event) => {
  if (!measurementId()) return;
  const choice = event.target.closest('[data-bp-consent]');
  if (choice) { saveConsent(choice.dataset.bpConsent); return; }
  const trigger = event.target.closest('[data-bp-modal-open]');
  if (trigger) {
    const section = { 'bp-menu-modal': 'menu_open', 'bp-newsletter-modal': 'newsletter_open', 'bp-hours-modal': 'hours_open', 'bp-about-modal': 'about_open' }[trigger.dataset.bpModalOpen];
    if (section) track(section);
    if (section === 'menu_open') { lastMenuPage = undefined; menuPageView(); }
    return;
  }
  const link = event.target.closest('a[href]');
  if (!link) return;
  if (link.matches('.bp-book-button')) track('reservation_click', { booking_provider: 'opentable' });
  else if (link.matches('.bp-contact a[href^="tel:"]')) track('contact_click', { contact_method: 'phone' });
  else if (link.matches('.bp-contact a[href^="mailto:"]')) track('contact_click', { contact_method: 'email' });
  else if (link.matches('.bp-socials a')) {
    const host = new URL(link.href).hostname;
    const network = { 'wa.me': 'whatsapp', 'www.instagram.com': 'instagram', 'www.facebook.com': 'facebook' }[host];
    if (network) track(network === 'whatsapp' ? 'contact_click' : 'social_click', network === 'whatsapp' ? { contact_method: 'whatsapp' } : { social_network: network });
  } else if (link.closest('[data-bp-menu]')) {
    const match = new URL(link.href).pathname.match(/^\/menus\/boardwalk-prime\/(menu|page-([1-3]))\.pdf$/);
    if (match) track('menu_pdf_open', { menu_document: match[1], ...(match[2] ? { menu_page: Number(match[2]) } : {}) });
  }
});

window.addEventListener('storage', (event) => { if (event.key === preferenceKey || event.key === null) applyConsent(readPreference()); });
document.addEventListener('turbo:before-cache', () => menuObserver?.disconnect());
document.addEventListener('turbo:load', initAnalytics);
document.addEventListener('DOMContentLoaded', initAnalytics);
