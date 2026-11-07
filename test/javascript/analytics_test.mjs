import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../../app/javascript/analytics.js', import.meta.url), 'utf8');

function harness({ id = 'G-TEST123', saved } = {}) {
  const handlers = {};
  const windowHandlers = {};
  const scripts = [];
  const storage = new Map(saved ? [['bp-analytics-consent-v1', JSON.stringify(saved)]] : []);
  const banner = { hidden: true };
  const status = {};
  const cookies = new Map([['_ga', 'browser'], ['_ga_TEST123', 'session'], ['essential', 'keep']]);
  let observer;
  let menu;
  const document = {
    title: 'Boardwalk Prime',
    referrer: 'https://example.com/story?email=private@example.com',
    body: {},
    head: { append: (script) => scripts.push(script) },
    createElement: () => ({ dataset: {} }),
    getElementById: () => ({ close() {} }),
    querySelector: (selector) => ({ 'meta[name="bp-ga4-id"]': id ? { content: id } : null, '[data-bp-consent-banner]': banner, '[data-bp-consent-status]': status, '[data-bp-menu]': menu })[selector],
    addEventListener: (name, callback) => { handlers[name] = callback; }
  };
  Object.defineProperty(document, 'cookie', {
    get: () => [...cookies].map(([key, value]) => `${key}=${value}`).join('; '),
    set: (value) => { if (value.includes('max-age=0')) cookies.delete(value.split('=')[0]); }
  });
  const window = {
    location: new URL('https://www.boardwalkprime.com/?utm_source=instagram&email=private@example.com#private'),
    localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    addEventListener: (name, callback) => { windowHandlers[name] = callback; }
  };
  const context = vm.createContext({ document, window, URL, Date, MutationObserver: class { constructor(callback) { observer = callback; } observe() {} disconnect() {} } });
  vm.runInContext(source, context);
  const dispatch = (name) => handlers[name]?.();
  const click = (selectors) => handlers.click({ target: { closest: (selector) => selectors[selector] || null } });
  const choose = (value) => click({ '[data-bp-consent]': { dataset: { bpConsent: value } } });
  const events = () => (window.dataLayer || []).map((item) => [...item]);
  const measured = (name) => events().filter((item) => item[0] === 'event' && item[1] === name);
  return { window, document, scripts, banner, status, cookies, storage, dispatch, click, choose, events, measured,
    storageEvent: () => windowHandlers.storage({ key: 'bp-analytics-consent-v1' }),
    setMenu: (value) => { menu = value; }, mutateMenu: () => observer() };
}

test('unconfigured sites do not show consent UI or load Google', () => {
  const h = harness({ id: null });
  h.dispatch('turbo:load');
  assert.equal(h.banner.hidden, true);
  assert.equal(h.scripts.length, 0);
});

test('no Google requests or analytics cookies before consent', () => {
  const h = harness();
  h.dispatch('DOMContentLoaded');
  assert.equal(h.banner.hidden, false);
  assert.equal(h.scripts.length, 0);
  assert.equal(h.events().length, 0);
});

test('consent loads one tag, denies advertising and sends exactly one initial pageview', () => {
  const h = harness();
  h.dispatch('DOMContentLoaded');
  h.choose('granted');
  h.dispatch('turbo:load');
  h.dispatch('DOMContentLoaded');
  assert.equal(h.scripts.length, 1);
  assert.equal(h.measured('page_view').length, 1);
  const config = h.events().find((item) => item[0] === 'config')[2];
  assert.equal(config.send_page_view, false);
  assert.equal(h.events().some((item) => item[0] === 'set' && item[1] === 'send_page_view' && item[2] === false), true);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(h.events().find((item) => item[0] === 'consent')[2].ad_user_data, 'denied');
  const page = h.measured('page_view')[0][2];
  assert.equal(page.page_location, 'https://www.boardwalkprime.com/?utm_source=instagram');
  assert.equal(page.page_referrer, 'https://example.com/story');
  assert.equal(JSON.stringify(h.events()).includes('private@example.com'), false);
  h.document.body = {};
  h.dispatch('turbo:load');
  assert.equal(h.measured('page_view').length, 2);
});

test('revocation disables measurement and clears only analytics cookies', () => {
  const h = harness();
  h.choose('granted');
  h.choose('denied');
  h.click({ '[data-bp-modal-open]': { dataset: { bpModalOpen: 'bp-menu-modal' } } });
  assert.equal(h.window['ga-disable-G-TEST123'], true);
  assert.equal(h.measured('menu_open').length, 0);
  assert.equal(h.cookies.has('_ga'), false);
  assert.equal(h.cookies.has('_ga_TEST123'), false);
  assert.equal(h.cookies.get('essential'), 'keep');
  assert.equal(JSON.parse(h.storage.get('bp-analytics-consent-v1')).value, 'denied');
});

test('expired preferences require a fresh choice; returning consent loads analytics', () => {
  const expired = harness({ saved: { value: 'granted', expires: Date.now() - 1 } });
  expired.dispatch('turbo:load');
  assert.equal(expired.scripts.length, 0);
  assert.equal(expired.banner.hidden, false);
  const returning = harness({ saved: { value: 'granted', expires: Date.now() + 10000 } });
  returning.dispatch('turbo:load');
  assert.equal(returning.scripts.length, 1);
});

test('cross-tab revocation immediately disables analytics', () => {
  const h = harness();
  h.choose('granted');
  h.storage.set('bp-analytics-consent-v1', JSON.stringify({ value: 'denied', expires: Date.now() + 10000 }));
  h.storageEvent();
  assert.equal(h.window['ga-disable-G-TEST123'], true);
});

test('restaurant actions report only predefined values and menu pages', () => {
  const h = harness();
  const leaves = [{ inert: false }, { inert: true }, { inert: true }];
  h.setMenu({ open: true, querySelectorAll: () => leaves });
  h.dispatch('turbo:load');
  h.choose('granted');
  h.click({ '[data-bp-modal-open]': { dataset: { bpModalOpen: 'bp-menu-modal' } } });
  h.mutateMenu();
  leaves[0].inert = true;
  leaves[1].inert = false;
  h.mutateMenu();
  assert.equal(h.measured('menu_open').length, 1);
  assert.equal(h.measured('menu_page_view').length, 2);
  assert.equal(h.measured('menu_page_view')[1][2].menu_page, 2);
  const reservation = { matches: (selector) => selector === '.bp-book-button' };
  h.click({ 'a[href]': reservation });
  assert.equal(h.measured('reservation_click')[0][2].booking_provider, 'opentable');
  const phone = { matches: (selector) => selector === '.bp-contact a[href^="tel:"]' };
  h.click({ 'a[href]': phone });
  assert.equal(h.measured('contact_click')[0][2].contact_method, 'phone');
});
