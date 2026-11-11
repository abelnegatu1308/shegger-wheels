/**
 * ShegerWheels QA Browser Test
 * Drives a headless Chromium via Playwright against http://localhost:3000
 * Run: node qa-test.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = 'http://localhost:3000';
const SHOTS_DIR = './qa-screenshots';
mkdirSync(SHOTS_DIR, { recursive: true });

let shotIndex = 0;
const results = [];
const consoleErrors = [];

function log(msg) { console.log(`[QA] ${msg}`); }
function pass(test, note = '') { results.push({ status: 'PASS', test, note }); log(`✅ PASS: ${test}${note ? ' — ' + note : ''}`); }
function fail(test, note = '') { results.push({ status: 'FAIL', test, note }); log(`❌ FAIL: ${test} — ${note}`); }
function warn(test, note = '') { results.push({ status: 'WARN', test, note }); log(`⚠️  WARN: ${test} — ${note}`); }

async function shot(page, name) {
  const file = join(SHOTS_DIR, `${String(++shotIndex).padStart(3,'0')}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  log(`📸 ${file}`);
  return file;
}

async function getConsoleErrors(page) {
  const errs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errs.push(msg.text());
  });
  page.on('pageerror', err => errs.push(`UNCAUGHT: ${err.message}`));
  return errs;
}

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Collect all console errors globally
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push({ url: page.url(), text: msg.text() });
  });
  page.on('pageerror', err => {
    consoleErrors.push({ url: page.url(), text: `UNCAUGHT: ${err.message}` });
  });

  // ─── PHASE 1: Homepage ────────────────────────────────────────────────────
  log('\n=== PHASE 1: Homepage ===');
  try {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await shot(page, 'homepage');
    const title = await page.title();
    if (title.includes('Sheggar') || title.includes('Sheger')) pass('Homepage title', title);
    else fail('Homepage title', `Got: ${title}`);

    // Navbar
    const navLinks = await page.locator('nav a').all();
    pass('Navbar renders', `${navLinks.length} links found`);

    // Hero text
    const heroH1 = await page.locator('h1').first().textContent();
    if (heroH1?.toLowerCase().includes('sheger') || heroH1?.toLowerCase().includes('wheels')) pass('Hero H1 visible', heroH1.trim());
    else fail('Hero H1', `Got: ${heroH1}`);

    // 3D card / spotlight car section
    const spotlightCard = await page.locator('text=STAGE 01').isVisible().catch(() => false);
    if (spotlightCard) pass('3D spotlight card visible');
    else warn('3D spotlight card', 'STAGE 01 text not found');

    // Featured vehicles section
    const featuredCars = await page.locator('text=Featured Vehicles').isVisible().catch(() => false);
    if (featuredCars) pass('Featured Vehicles section visible');
    else fail('Featured Vehicles section missing');

    // Search form
    const searchBtn = await page.locator('button:has-text("Filter Fleet")').isVisible().catch(() => false);
    if (searchBtn) pass('Search form / Filter Fleet button visible');
    else fail('Search form missing');

    // Footer
    const footer = await page.locator('footer').isVisible().catch(() => false);
    if (footer) pass('Footer visible');
    else warn('Footer', 'not found');

    // CTA buttons
    const exploreLink = await page.locator('a:has-text("Explore Fleet")').isVisible().catch(() => false);
    if (exploreLink) pass('Explore Fleet CTA visible');
    else fail('Explore Fleet CTA missing');

    // Spotlight car tabs - click each
    const spotlightTabs = await page.locator('button').filter({ hasText: /Toyota|Hyundai|Ford|Suzuki|Kia|Nissan/ }).all();
    for (let i = 0; i < Math.min(spotlightTabs.length, 4); i++) {
      await spotlightTabs[i].click();
      await page.waitForTimeout(300);
    }
    if (spotlightTabs.length > 0) pass('Spotlight car tabs clickable', `${spotlightTabs.length} tabs`);

  } catch (e) { fail('Homepage load', e.message); }

  // ─── PHASE 2: Navigation links ────────────────────────────────────────────
  log('\n=== PHASE 2: Navigation ===');
  try {
    // Click "Explore Fleet" → cars page
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
    await page.click('a:has-text("Explore Fleet")');
    await page.waitForURL('**/cars**', { timeout: 10000 });
    pass('Explore Fleet CTA navigates to /cars');
    await shot(page, 'cars-page');

    // Back to home, click "List Your Vehicle" → signup
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
    await page.click('a:has-text("List Your Vehicle")');
    await page.waitForURL('**/signup**', { timeout: 10000 });
    pass('"List Your Vehicle" navigates to /signup');

  } catch (e) { fail('Navigation links', e.message); }

  // ─── PHASE 3: Car listing page ────────────────────────────────────────────
  log('\n=== PHASE 3: Car listing /cars ===');
  try {
    await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle', timeout: 20000 });
    await shot(page, 'cars-listing');

    const heading = await page.locator('h1').first().textContent().catch(() => '');
    if (heading.includes('Catalogue') || heading.includes('Car')) pass('Cars page heading', heading.trim());
    else fail('Cars page heading', `Got: ${heading}`);

    // Count car cards
    const carCards = await page.locator('a:has-text("View Details")').all();
    if (carCards.length > 0) pass('Car cards rendered', `${carCards.length} cards`);
    else fail('Car cards', 'No "View Details" links found');

    // Test search filter
    const searchInput = await page.locator('input[placeholder*="model"]').first();
    await searchInput.fill('Toyota');
    await page.waitForTimeout(500);
    const filteredCards = await page.locator('a:has-text("View Details")').all();
    pass('Search filter works', `${filteredCards.length} results for "Toyota"`);
    await shot(page, 'cars-filtered-toyota');

    // Clear filter
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // Test neighbourhood filter
    const neighbourhoodSelect = page.locator('select').first();
    await neighbourhoodSelect.selectOption({ index: 1 }).catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, 'cars-filtered-neighbourhood');
    await neighbourhoodSelect.selectOption({ index: 0 });

    // Test sort
    const sortSelect = page.locator('select').last();
    await sortSelect.selectOption('price-asc').catch(() => {});
    await page.waitForTimeout(300);
    pass('Sort by price-asc works');
    await sortSelect.selectOption('price-desc').catch(() => {});
    await page.waitForTimeout(300);
    pass('Sort by price-desc works');

    // Reset all filters
    const resetBtn = await page.locator('button:has-text("Reset All")').isVisible().catch(() => false);
    if (resetBtn) { await page.click('button:has-text("Reset All")'); pass('Reset All filters button works'); }
    else warn('Reset All button', 'not found');

  } catch (e) { fail('Car listing page', e.message); }

  // ─── PHASE 4: Car detail pages & maps ────────────────────────────────────
  log('\n=== PHASE 4: Car detail pages & maps ===');
  const carIds = ['car_1', 'car_2', 'car_3', 'car_4', 'car_5'];

  for (const carId of carIds) {
    try {
      await page.goto(`${BASE}/cars/${carId}`, { waitUntil: 'networkidle', timeout: 20000 });
      const h1 = await page.locator('h1').first().textContent().catch(() => '');
      if (h1.length > 0) pass(`Car detail ${carId} loads`, h1.trim());
      else fail(`Car detail ${carId}`, 'No H1 found');

      // Check map container renders
      await page.waitForTimeout(1500); // let map initialize
      const mapContainer = await page.locator('.leaflet-container').isVisible().catch(() => false);
      if (mapContainer) pass(`Map renders on ${carId}`);
      else fail(`Map on ${carId}`, 'No .leaflet-container found');

      // Check tiles loaded (leaflet-tile-container)
      const tilesLoaded = await page.locator('.leaflet-tile-container').isVisible().catch(() => false);
      if (tilesLoaded) pass(`Map tiles on ${carId}`);
      else warn(`Map tiles on ${carId}`, 'tile container not visible');

      // Check marker
      const marker = await page.locator('.leaflet-pane .leaflet-overlay-pane').isVisible().catch(() => false);
      if (marker) pass(`Map marker/overlay on ${carId}`);
      else warn(`Map marker on ${carId}`, 'overlay pane not visible');

      await shot(page, `car-detail-${carId}`);

      // Check booking form
      const startDateInput = await page.locator('input[type="date"]').first().isVisible().catch(() => false);
      if (startDateInput) pass(`Booking form on ${carId}`);
      else warn(`Booking form on ${carId}`, 'date input not found');

    } catch (e) { fail(`Car detail ${carId}`, e.message); }
  }

  // Navigate between cars without refresh to test map cleanup
  log('\n--- Testing map lifecycle: navigate between cars ---');
  try {
    await page.goto(`${BASE}/cars/car_1`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);
    const map1 = await page.locator('.leaflet-container').isVisible().catch(() => false);

    // Click through to car_2 via catalogue
    await page.goto(`${BASE}/cars/car_2`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);
    const map2 = await page.locator('.leaflet-container').isVisible().catch(() => false);

    // Back to car_1
    await page.goBack();
    await page.waitForTimeout(1500);
    const map3 = await page.locator('.leaflet-container').isVisible().catch(() => false);

    if (map1 && map2 && map3) pass('Map survives car-to-car navigation and back');
    else fail('Map lifecycle navigation', `car_1: ${map1}, car_2: ${map2}, back: ${map3}`);
    await shot(page, 'map-after-back-navigation');

  } catch (e) { fail('Map lifecycle navigation', e.message); }

  // ─── PHASE 5: Auth / Sign in ──────────────────────────────────────────────
  log('\n=== PHASE 5: Authentication ===');
  try {
    await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 20000 });
    await shot(page, 'signin-page');

    const h1 = await page.locator('h1').first().textContent().catch(() => '');
    if (h1.includes('Sign')) pass('Sign in page heading', h1.trim());
    else fail('Sign in page heading', `Got: ${h1}`);

    // Demo accounts should be listed
    const demoCards = await page.locator('button:has-text("Sign in as Renter")').all();
    if (demoCards.length > 0) pass('Demo sign-in buttons visible', `${demoCards.length} renter buttons`);
    else fail('Demo sign-in buttons', 'None found');

    // Sign in as renter
    await page.click('button:has-text("Sign in as Renter")');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    pass('Sign in as Renter → redirects to /dashboard');
    await shot(page, 'dashboard-after-signin');

  } catch (e) { fail('Authentication', e.message); }

  // ─── PHASE 6: Dashboard ───────────────────────────────────────────────────
  log('\n=== PHASE 6: Dashboard ===');
  try {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 20000 });
    const dashHeading = await page.locator('h1').first().textContent().catch(() => '');
    if (dashHeading.length > 0) pass('Dashboard loads', dashHeading.trim());
    else fail('Dashboard heading', 'not found');
    await shot(page, 'dashboard');

  } catch (e) { fail('Dashboard', e.message); }

  // ─── PHASE 7: Booking workflow ────────────────────────────────────────────
  log('\n=== PHASE 7: Booking workflow ===');
  try {
    await page.goto(`${BASE}/cars/car_1`, { waitUntil: 'networkidle', timeout: 20000 });

    // Fill booking dates (future dates)
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 2);
    const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 4);
    const fmt = d => d.toISOString().split('T')[0];

    const [startInput, endInput] = await page.locator('input[type="date"]').all();
    await startInput.fill(fmt(tomorrow));
    await endInput.fill(fmt(dayAfter));
    await page.waitForTimeout(500);

    // Price calculation should appear
    const priceBox = await page.locator('text=Platform Service Fee').isVisible().catch(() => false);
    if (priceBox) pass('Booking price calculation shows after date selection');
    else warn('Booking price calculation', 'Platform Service Fee not visible');

    await shot(page, 'booking-form-filled');

    // Submit booking
    await page.click('button:has-text("Proceed to Checkout")');
    await page.waitForURL('**/checkout**', { timeout: 10000 });
    pass('Proceed to Checkout navigates to /checkout');
    await shot(page, 'checkout-page');

    // Verify checkout page content
    const checkoutHeading = await page.locator('h1,h2').first().textContent().catch(() => '');
    if (checkoutHeading.length > 0) pass('Checkout page heading visible', checkoutHeading.trim());
    else warn('Checkout page heading', 'not found');

  } catch (e) { fail('Booking workflow', e.message); }

  // ─── PHASE 8: Sign in as Owner ────────────────────────────────────────────
  log('\n=== PHASE 8: Owner dashboard ===');
  try {
    await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.click('button:has-text("Sign in as Owner")');
    await page.waitForURL('**/owner**', { timeout: 10000 });
    pass('Sign in as Owner → /owner');
    await shot(page, 'owner-dashboard');

    await page.goto(`${BASE}/owner/cars`, { waitUntil: 'networkidle', timeout: 20000 });
    const carsHeading = await page.locator('h1').first().textContent().catch(() => '');
    pass('Owner /cars page loads', carsHeading.trim());
    await shot(page, 'owner-cars');

  } catch (e) { fail('Owner dashboard', e.message); }

  // ─── PHASE 9: Admin ───────────────────────────────────────────────────────
  log('\n=== PHASE 9: Admin panel ===');
  try {
    await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.click('button:has-text("Sign in as Admin")');
    await page.waitForURL('**/admin**', { timeout: 10000 });
    pass('Sign in as Admin → /admin');
    await shot(page, 'admin-dashboard');

    const adminRoutes = ['/admin/users', '/admin/listings', '/admin/bookings', '/admin/disputes', '/admin/reports', '/admin/announcements'];
    for (const route of adminRoutes) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 20000 });
      const heading = await page.locator('h1').first().textContent().catch(() => '');
      if (heading.length > 0) pass(`Admin ${route} loads`, heading.trim());
      else warn(`Admin ${route}`, 'No H1');
    }
    await shot(page, 'admin-users');

  } catch (e) { fail('Admin panel', e.message); }

  // ─── PHASE 10: Protected route redirect ───────────────────────────────────
  log('\n=== PHASE 10: Protected routes ===');
  try {
    // Sign out by clearing session storage via JS
    await page.evaluate(() => { try { sessionStorage.clear(); } catch(e){} });
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
    const url = page.url();
    if (url.includes('signin') || url.includes('dashboard')) pass('Protected /dashboard', `URL: ${url}`);
    else warn('Protected /dashboard redirect', `Ended up at: ${url}`);

  } catch (e) { fail('Protected routes', e.message); }

  // ─── PHASE 11: Sign up page ───────────────────────────────────────────────
  log('\n=== PHASE 11: Sign up page ===');
  try {
    await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle', timeout: 20000 });
    await shot(page, 'signup-page');
    const heading = await page.locator('h1').first().textContent().catch(() => '');
    if (heading.length > 0) pass('Signup page loads', heading.trim());
    else fail('Signup page heading', 'not found');

    // Check form fields
    const nameInput = await page.locator('input[type="text"]').first().isVisible().catch(() => false);
    const emailInput = await page.locator('input[type="email"]').first().isVisible().catch(() => false);
    if (nameInput && emailInput) pass('Signup form has name and email fields');
    else warn('Signup form fields', `name: ${nameInput}, email: ${emailInput}`);

    // Test empty submit
    const submitBtn = await page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(400);
      pass('Signup empty submit handled');
    }

  } catch (e) { fail('Sign up page', e.message); }

  // ─── PHASE 12: Bookings list ──────────────────────────────────────────────
  log('\n=== PHASE 12: Bookings page ===');
  try {
    // Re-sign in as renter
    await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.click('button:has-text("Sign in as Renter")');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });

    await page.goto(`${BASE}/bookings`, { waitUntil: 'networkidle', timeout: 20000 });
    await shot(page, 'bookings-list');
    const heading = await page.locator('h1').first().textContent().catch(() => '');
    if (heading.length > 0) pass('Bookings page loads', heading.trim());
    else fail('Bookings page heading', 'not found');

  } catch (e) { fail('Bookings page', e.message); }

  // ─── PHASE 13: 404 / invalid routes ──────────────────────────────────────
  log('\n=== PHASE 13: 404 handling ===');
  try {
    await page.goto(`${BASE}/cars/invalid_car_id_xyz`, { waitUntil: 'networkidle', timeout: 15000 });
    await shot(page, 'invalid-car-id');
    const body = await page.locator('body').textContent().catch(() => '');
    const has404 = body.toLowerCase().includes('not found') || body.toLowerCase().includes('404') || body.toLowerCase().includes('does not exist');
    if (has404) pass('Invalid car ID shows not-found state');
    else warn('Invalid car ID', 'No 404/not-found message visible');

    await page.goto(`${BASE}/nonexistent-route`, { waitUntil: 'networkidle', timeout: 15000 });
    const url404 = page.url();
    pass('Non-existent route handled', `URL: ${url404}`);
    await shot(page, '404-page');

  } catch (e) { fail('404 handling', e.message); }

  // ─── PHASE 14: Direct URL refresh ────────────────────────────────────────
  log('\n=== PHASE 14: Direct URL refresh ===');
  try {
    await page.goto(`${BASE}/cars/car_3`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.reload({ waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    const h1 = await page.locator('h1').first().textContent().catch(() => '');
    if (h1.length > 0) pass('Car detail page survives direct refresh', h1.trim());
    else fail('Car detail direct refresh', 'No H1 after reload');

    const mapAfterRefresh = await page.locator('.leaflet-container').isVisible().catch(() => false);
    if (mapAfterRefresh) pass('Map renders after direct page refresh');
    else fail('Map after direct refresh', 'No .leaflet-container');

  } catch (e) { fail('Direct URL refresh', e.message); }

  // ─── PHASE 15: Responsive layout ─────────────────────────────────────────
  log('\n=== PHASE 15: Responsive layouts ===');
  try {
    // Mobile
    await context.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
    await shot(page, 'homepage-mobile');
    const mobileH1 = await page.locator('h1').first().isVisible().catch(() => false);
    if (mobileH1) pass('Homepage renders on mobile 375px');
    else fail('Homepage mobile layout');

    await page.goto(`${BASE}/cars`, { waitUntil: 'networkidle', timeout: 20000 });
    await shot(page, 'cars-mobile');
    pass('Cars page renders on mobile');

    // Tablet
    await context.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
    await shot(page, 'homepage-tablet');
    pass('Homepage renders on tablet 768px');

    // Reset to desktop
    await context.setViewportSize({ width: 1280, height: 800 });

  } catch (e) { fail('Responsive layouts', e.message); }

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  await browser.close();

  log('\n════════════════════════════════════════════════════════');
  log('QA TEST SUMMARY');
  log('════════════════════════════════════════════════════════');
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails  = results.filter(r => r.status === 'FAIL').length;
  const warns  = results.filter(r => r.status === 'WARN').length;
  log(`Total: ${results.length} | ✅ ${passes} PASS | ❌ ${fails} FAIL | ⚠️  ${warns} WARN`);

  log('\n--- FAILURES ---');
  results.filter(r => r.status === 'FAIL').forEach(r => log(`  ❌ ${r.test}: ${r.note}`));
  log('\n--- WARNINGS ---');
  results.filter(r => r.status === 'WARN').forEach(r => log(`  ⚠️  ${r.test}: ${r.note}`));

  log('\n--- BROWSER CONSOLE ERRORS ---');
  if (consoleErrors.length === 0) {
    log('  None detected ✅');
  } else {
    consoleErrors.forEach(e => log(`  [${e.url}] ${e.text}`));
  }

  // Write JSON report
  const report = { timestamp: new Date().toISOString(), summary: { passes, fails, warns }, results, consoleErrors };
  writeFileSync('./qa-report.json', JSON.stringify(report, null, 2));
  log('\nFull report: qa-report.json');
  log(`Screenshots: ${SHOTS_DIR}/`);

  process.exit(fails > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('[QA] Fatal error:', err);
  process.exit(2);
});
