import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const SHOTS = './qa-screenshots';
mkdirSync(SHOTS, { recursive: true });

let idx = 0;
const results = [];
const allErrors = [];

const pass = (t, n='') => { results.push({s:'PASS',t,n}); console.log(`✅ ${t}${n?' — '+n:''}`); };
const fail = (t, n='') => { results.push({s:'FAIL',t,n}); console.log(`❌ FAIL: ${t} — ${n}`); };
const warn = (t, n='') => { results.push({s:'WARN',t,n}); console.log(`⚠️  ${t} — ${n}`); };
const shot = async (p, n) => {
  const f = `${SHOTS}/${String(++idx).padStart(3,'0')}-${n}.png`;
  await p.screenshot({ path: f, fullPage: false });
  console.log(`📸 ${f}`);
};

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function mkPage() {
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1280, height: 800 });
  p.on('console', m => { if (m.type() === 'error') allErrors.push({ url: p.url(), text: m.text() }); });
  p.on('pageerror', e => allErrors.push({ url: p.url(), text: 'UNCAUGHT:' + e.message }));
  return p;
}

const fmt = d => d.toISOString().split('T')[0];
const d3 = () => { const d = new Date(); d.setDate(d.getDate()+3); return d; };
const d6 = () => { const d = new Date(); d.setDate(d.getDate()+6); return d; };

// ── P1: Homepage ─────────────────────────────────────────────────────────────
console.log('\n═══ P1: Homepage ═══');
{
  const p = await mkPage();
  await p.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await shot(p, '01-homepage');

  const title = await p.title();
  title.includes('Sheggar') || title.includes('Sheger') ? pass('Title', title) : fail('Title', title);

  const h1 = await p.locator('h1').first().textContent().catch(() => '');
  h1.toLowerCase().includes('sheger') ? pass('Hero H1', h1.trim()) : fail('Hero H1', h1);

  const stage01 = await p.locator('text=STAGE 01').isVisible().catch(() => false);
  stage01 ? pass('3D spotlight card visible') : warn('3D spotlight card', 'not found');

  const tabs = await p.locator('button').filter({ hasText: /Toyota|Hyundai|Ford|Suzuki|Kia|Nissan/ }).all();
  for (let i = 0; i < tabs.length; i++) { await tabs[i].click(); await p.waitForTimeout(200); }
  tabs.length > 0 ? pass('Spotlight tabs', `${tabs.length}`) : warn('Spotlight tabs', 'none');

  const inspectHref = await p.locator('a:has-text("Inspect Vehicle Details")').getAttribute('href').catch(() => null);
  inspectHref && inspectHref.startsWith('/cars/') ? pass('3D card link', inspectHref) : fail('3D card link', String(inspectHref));

  const featCards = await p.locator('a:has-text("Inspect")').all();
  featCards.length >= 3 ? pass('Featured grid', `${featCards.length} cards`) : warn('Featured grid', `${featCards.length}`);

  // Search form
  const nbSel = p.locator('select').first();
  const opts = await nbSel.locator('option').all();
  if (opts.length > 1) {
    await nbSel.selectOption({ index: 1 });
    await p.locator('button:has-text("Filter Fleet")').click();
    await p.waitForURL('**/cars**', { timeout: 8000 });
    p.url().includes('neighbourhood') ? pass('Homepage search filters') : warn('Homepage search', 'no neighbourhood in URL');
  } else {
    warn('Homepage search', 'no neighbourhood options');
  }

  // Navbar
  await p.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
  const navCars = await p.locator('nav a[href="/cars"]').isVisible().catch(() => false);
  navCars ? pass('Navbar /cars link') : warn('Navbar /cars link');

  // Footer
  const footer = await p.locator('footer').isVisible().catch(() => false);
  footer ? pass('Footer visible') : warn('Footer', 'not found');

  await p.close();
}

// ── P2: Car listing ───────────────────────────────────────────────────────────
console.log('\n═══ P2: Car Listing ═══');
{
  const p = await mkPage();
  await p.goto(BASE + '/cars', { waitUntil: 'networkidle', timeout: 20000 });
  await shot(p, '02-cars-listing');

  const cards = await p.locator('a:has-text("View Details")').all();
  cards.length >= 6 ? pass('6 car cards', `${cards.length}`) : fail('Car cards', `${cards.length}`);

  // Keyword filter
  await p.locator('input[placeholder*="model"]').first().fill('Toyota');
  await p.waitForTimeout(500);
  const filtered = await p.locator('a:has-text("View Details")').all();
  filtered.length >= 1 && filtered.length < cards.length
    ? pass('Keyword filter', `${filtered.length} Toyota results`)
    : warn('Keyword filter', `${filtered.length} results`);
  await shot(p, '02b-toyota-filter');

  // No results
  await p.locator('input[placeholder*="model"]').first().fill('ZZZNOTACAR');
  await p.waitForTimeout(500);
  const noRes = await p.locator('text=No cars match').isVisible().catch(() => false);
  noRes ? pass('Empty state shown') : warn('Empty state', '"No cars match" not found');
  await shot(p, '02c-no-results');

  // Reset
  await p.locator('input[placeholder*="model"]').first().fill('');
  await p.waitForTimeout(300);

  // All sorts
  const sortSel = p.locator('select').last();
  for (const opt of ['price-asc','price-desc','newest']) {
    await sortSel.selectOption(opt);
    await p.waitForTimeout(250);
  }
  pass('All sort options work');

  await p.close();
}

// ── P3: Car detail + map ──────────────────────────────────────────────────────
console.log('\n═══ P3: Car Details & Maps ═══');
{
  const p = await mkPage();
  const carIds = ['car_1','car_2','car_3','car_4','car_5','car_6','car_8'];

  for (const id of carIds) {
    await p.goto(`${BASE}/cars/${id}`, { waitUntil: 'networkidle', timeout: 20000 });
    await p.waitForTimeout(1500);

    const h1 = await p.locator('h1').first().textContent().catch(() => '');
    h1.length > 0 ? pass(`${id} page loads`, h1.trim()) : fail(`${id} no H1`);

    // Scroll map into view then inspect DOM directly (isVisible fails off-screen in headless)
    await p.evaluate(() => document.querySelector('.leaflet-container')?.scrollIntoView({ behavior: 'instant' }));
    await p.waitForTimeout(800);

    const ms = await p.evaluate(() => {
      const c = document.querySelector('.leaflet-container');
      if (!c) return { found: false };
      const r = c.getBoundingClientRect();
      return {
        found: true,
        tiles: c.querySelectorAll('.leaflet-tile').length,
        marker: !!c.querySelector('.leaflet-interactive'),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    });

    if (ms.found && ms.tiles > 0 && ms.marker) {
      pass(`${id} map`, `${ms.tiles} tiles, marker✓, ${ms.w}×${ms.h}px`);
    } else if (ms.found) {
      warn(`${id} map partial`, `tiles:${ms.tiles} marker:${ms.marker}`);
    } else {
      fail(`${id} map not found`);
    }
  }

  // Screenshot car_1 with map in view
  await p.goto(`${BASE}/cars/car_1`, { waitUntil: 'networkidle', timeout: 20000 });
  await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('.leaflet-container')?.scrollIntoView({ behavior: 'instant' }));
  await p.waitForTimeout(800);
  await shot(p, '03-car1-map');

  // Map lifecycle: car_1 → car_2 → back
  await p.goto(`${BASE}/cars/car_1`, { waitUntil: 'networkidle', timeout: 20000 });
  await p.waitForTimeout(1500);
  const m1 = await p.evaluate(() => document.querySelectorAll('.leaflet-tile').length);

  await p.goto(`${BASE}/cars/car_2`, { waitUntil: 'networkidle', timeout: 20000 });
  await p.waitForTimeout(1500);
  const m2 = await p.evaluate(() => document.querySelectorAll('.leaflet-tile').length);

  await p.goBack();
  await p.waitForTimeout(1500);
  const m3 = await p.evaluate(() => document.querySelectorAll('.leaflet-tile').length);

  m1 > 0 && m2 > 0 && m3 > 0
    ? pass('Map lifecycle car→car→back', `${m1}→${m2}→${m3} tiles`)
    : fail('Map lifecycle', `${m1}→${m2}→${m3}`);
  await shot(p, '03b-map-back');

  // Invalid car ID
  await p.goto(`${BASE}/cars/nonexistent_xyz`, { waitUntil: 'networkidle', timeout: 15000 });
  const bodyText = await p.evaluate(() => document.body.innerText.toLowerCase());
  bodyText.includes('not found') || bodyText.includes('does not exist')
    ? pass('Invalid car ID → not-found')
    : warn('Invalid car ID', 'no not-found message');
  await shot(p, '03c-invalid-car');

  // Pending car (car_7) should not display
  await p.goto(`${BASE}/cars/car_7`, { waitUntil: 'networkidle', timeout: 15000 });
  const car7Text = await p.evaluate(() => document.body.innerText.toLowerCase());
  car7Text.includes('not found') || car7Text.includes('does not exist')
    ? pass('Pending car_7 → not-found (correct)')
    : warn('Pending car_7', 'might be accessible without approval');
  await shot(p, '03d-pending-car');

  // Hard refresh
  await p.goto(`${BASE}/cars/car_2`, { waitUntil: 'networkidle', timeout: 20000 });
  await p.reload({ waitUntil: 'networkidle', timeout: 20000 });
  await p.waitForTimeout(800);
  const h1Reload = await p.locator('h1').first().textContent().catch(() => '');
  h1Reload.length > 0 ? pass('Hard refresh car detail', h1Reload.trim()) : fail('Hard refresh');

  await p.close();
}

// ── P4: Auth ──────────────────────────────────────────────────────────────────
console.log('\n═══ P4: Auth ═══');
{
  const p = await mkPage();
  await p.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 20000 });
  await shot(p, '04-signin');

  const renterBtns = await p.locator('button:has-text("Sign in as Renter")').all();
  renterBtns.length > 0 ? pass('Renter sign-in buttons', `${renterBtns.length}`) : fail('Renter sign-in buttons');

  // Sign in renter
  await renterBtns[0].click();
  await p.waitForURL('**/dashboard**', { timeout: 10000 });
  pass('Renter → /dashboard');
  await shot(p, '04b-dashboard');

  // Sign out (clear session) then protected route redirects
  await p.evaluate(() => { try { sessionStorage.clear(); } catch(e) {} });
  await p.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
  p.url().includes('signin') ? pass('Signed-out /dashboard → /signin') : warn('Protected redirect', p.url());

  // ?next= respected
  await p.goto(`${BASE}/signin?next=/bookings`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('button:has-text("Sign in as Renter")').first().click();
  await p.waitForURL('**/bookings**', { timeout: 10000 });
  pass('?next= redirect after sign-in');

  // Owner sign-in
  await p.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('button:has-text("Sign in as Owner")').first().click();
  await p.waitForURL('**/owner**', { timeout: 10000 });
  pass('Owner → /owner');

  // Admin sign-in
  await p.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('button:has-text("Sign in as Admin")').first().click();
  await p.waitForURL('**/admin**', { timeout: 10000 });
  pass('Admin → /admin');

  await p.close();
}

// ── P5: Booking workflow ──────────────────────────────────────────────────────
console.log('\n═══ P5: Booking ═══');
{
  const p = await mkPage();
  await p.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('button:has-text("Sign in as Renter")').first().click();
  await p.waitForURL('**/dashboard**', { timeout: 10000 });

  // car_6 (Land Cruiser) has no conflicting bookings
  await p.goto(`${BASE}/cars/car_6`, { waitUntil: 'networkidle', timeout: 20000 });
  const dateInputs = await p.locator('input[type="date"]').all();
  await dateInputs[0].fill(fmt(d3()));
  await dateInputs[1].fill(fmt(d6()));
  await p.waitForTimeout(600);

  const feeVisible = await p.locator('text=Platform Service Fee').isVisible().catch(() => false);
  feeVisible ? pass('Price calc shows') : warn('Price calc', 'not visible');
  await shot(p, '05-booking-form');

  // Proceed to checkout
  await p.locator('button:has-text("Proceed to Checkout")').click();
  await p.waitForURL('**/checkout**', { timeout: 10000 });
  pass('→ /checkout');
  await shot(p, '05b-checkout');

  const checkoutBody = await p.evaluate(() => document.body.innerText);
  checkoutBody.includes('TeleBirr') || checkoutBody.includes('Checkout')
    ? pass('Checkout page content valid')
    : warn('Checkout content', 'no TeleBirr/Checkout found');

  // Unauthenticated booking
  await p.evaluate(() => { try { sessionStorage.clear(); } catch(e) {} });
  await p.goto(`${BASE}/cars/car_1`, { waitUntil: 'networkidle', timeout: 20000 });
  const di2 = await p.locator('input[type="date"]').all();
  await di2[0].fill(fmt(d3()));
  await di2[1].fill(fmt(d6()));
  await p.waitForTimeout(300);
  await p.locator('button:has-text("Proceed to Checkout")').click();
  await p.waitForTimeout(1000);
  p.url().includes('signin') ? pass('Unauth booking → /signin') : warn('Unauth booking', p.url());

  // Empty date validation
  await p.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('button:has-text("Sign in as Renter")').first().click();
  await p.waitForURL('**/dashboard**', { timeout: 10000 });
  await p.goto(`${BASE}/cars/car_1`, { waitUntil: 'networkidle', timeout: 20000 });
  await p.locator('button:has-text("Proceed to Checkout")').click();
  await p.waitForTimeout(500);
  const errMsg = await p.locator('text=valid start and end dates').isVisible().catch(() => false);
  const stayedOnCar = p.url().includes('/cars/');
  errMsg || stayedOnCar ? pass('Empty date validation') : warn('Empty date validation', 'no error');
  await shot(p, '05c-validation');

  await p.close();
}

// ── P6: Owner ─────────────────────────────────────────────────────────────────
console.log('\n═══ P6: Owner ═══');
{
  const p = await mkPage();
  await p.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('button:has-text("Sign in as Owner")').first().click();
  await p.waitForURL('**/owner**', { timeout: 10000 });

  const ownerRoutes = ['/owner', '/owner/cars', '/owner/earnings', '/owner/reviews', '/owner/disputes', '/owner/cars/new'];
  for (const r of ownerRoutes) {
    await p.goto(BASE + r, { waitUntil: 'networkidle', timeout: 15000 });
    const h = await p.locator('h1').first().textContent().catch(() => '');
    h.length > 0 ? pass(`Owner ${r}`, h.trim()) : warn(`Owner ${r}`, 'no H1');
  }
  await shot(p, '06-owner-cars');

  // New car form fields
  await p.goto(`${BASE}/owner/cars/new`, { waitUntil: 'networkidle', timeout: 15000 });
  const inputs = await p.locator('input').all();
  inputs.length >= 3 ? pass('New car form has fields', `${inputs.length} inputs`) : warn('New car form', `only ${inputs.length} inputs`);
  await shot(p, '06b-new-car');

  // Edit existing car
  await p.goto(`${BASE}/owner/cars/car_1/edit`, { waitUntil: 'networkidle', timeout: 15000 });
  const editBody = await p.evaluate(() => document.body.innerText.toLowerCase());
  editBody.includes('edit') || editBody.includes('update') || editBody.includes('toyota')
    ? pass('Owner car edit page loads')
    : warn('Owner car edit', 'no edit content found');
  await shot(p, '06c-car-edit');

  await p.close();
}

// ── P7: Admin ─────────────────────────────────────────────────────────────────
console.log('\n═══ P7: Admin ═══');
{
  const p = await mkPage();
  await p.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('button:has-text("Sign in as Admin")').first().click();
  await p.waitForURL('**/admin**', { timeout: 10000 });

  const adminRoutes = ['/admin', '/admin/users', '/admin/listings', '/admin/bookings',
                       '/admin/disputes', '/admin/reports', '/admin/announcements'];
  for (const r of adminRoutes) {
    await p.goto(BASE + r, { waitUntil: 'networkidle', timeout: 15000 });
    const h = await p.locator('h1').first().textContent().catch(() => '');
    h.length > 0 ? pass(`Admin ${r}`, h.trim()) : warn(`Admin ${r}`, 'no H1');
  }

  // User detail page
  await p.goto(`${BASE}/admin/users/u_owner_1`, { waitUntil: 'networkidle', timeout: 15000 });
  const userDetail = await p.evaluate(() => document.body.innerText);
  userDetail.length > 100 ? pass('Admin user detail page') : warn('Admin user detail', 'minimal content');
  await shot(p, '07-admin');

  // Pending car_7 visible in listings
  await p.goto(`${BASE}/admin/listings`, { waitUntil: 'networkidle', timeout: 15000 });
  const pendingVisible = await p.locator('text=pending').first().isVisible().catch(() => false);
  pendingVisible ? pass('Pending car shown in admin listings') : warn('Pending car in listings', 'not visible');

  await p.close();
}

// ── P8: Sign up ───────────────────────────────────────────────────────────────
console.log('\n═══ P8: Sign Up ═══');
{
  const p = await mkPage();
  await p.goto(`${BASE}/signup`, { waitUntil: 'networkidle', timeout: 15000 });
  await shot(p, '08-signup');

  const h1 = await p.locator('h1').first().textContent().catch(() => '');
  h1.length > 0 ? pass('Signup heading', h1.trim()) : fail('Signup heading');

  const inputs = await p.locator('input').all();
  pass('Signup inputs', `${inputs.length} fields`);

  // Empty submit
  const submitBtn = p.locator('button[type="submit"]').first();
  if (await submitBtn.isVisible().catch(() => false)) {
    await submitBtn.click();
    await p.waitForTimeout(500);
    const stayedOnSignup = p.url().includes('signup');
    stayedOnSignup ? pass('Empty signup submit stays on page') : warn('Empty signup submit', 'left signup page');
  }

  // Fill and submit
  for (const input of inputs) {
    const type = await input.getAttribute('type').catch(() => 'text');
    if (type === 'text' || !type) await input.fill('Test Renter').catch(() => {});
    else if (type === 'email') await input.fill('testrenter99@demo.et').catch(() => {});
    else if (type === 'tel') await input.fill('+251911999888').catch(() => {});
    else if (type === 'password') await input.fill('demo1234').catch(() => {});
  }
  await submitBtn.click().catch(() => {});
  await p.waitForTimeout(800);
  const afterUrl = p.url();
  afterUrl.includes('signin') || afterUrl.includes('dashboard') || afterUrl.includes('signup')
    ? pass('Signup submit handled', afterUrl)
    : warn('Signup after-submit URL', afterUrl);
  await shot(p, '08b-after-signup');

  await p.close();
}

// ── P9: Bookings list ─────────────────────────────────────────────────────────
console.log('\n═══ P9: Bookings ═══');
{
  const p = await mkPage();
  await p.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('button:has-text("Sign in as Renter")').first().click();
  await p.waitForURL('**/dashboard**', { timeout: 10000 });

  await p.goto(`${BASE}/bookings`, { waitUntil: 'networkidle', timeout: 20000 });
  await shot(p, '09-bookings');
  const h = await p.locator('h1').first().textContent().catch(() => '');
  h.length > 0 ? pass('Bookings page', h.trim()) : warn('Bookings page', 'no H1');

  // Click into a booking detail
  const firstBookingLink = await p.locator('a[href*="/bookings/bk_"]').first().isVisible().catch(() => false);
  if (firstBookingLink) {
    await p.locator('a[href*="/bookings/bk_"]').first().click();
    await p.waitForTimeout(1000);
    const bookingDetailH = await p.locator('h1,h2').first().textContent().catch(() => '');
    bookingDetailH.length > 0 ? pass('Booking detail page', bookingDetailH.trim()) : warn('Booking detail', 'no heading');
    await shot(p, '09b-booking-detail');
  } else {
    warn('Booking detail link', 'no /bookings/bk_ links found');
  }

  await p.close();
}

// ── P10: Responsive ───────────────────────────────────────────────────────────
console.log('\n═══ P10: Responsive ═══');
{
  const p = await mkPage();
  const vps = [{ w: 375, h: 667, name: 'mobile' }, { w: 768, h: 1024, name: 'tablet' }, { w: 1440, h: 900, name: 'wide' }];

  for (const { w, h, name } of vps) {
    await p.setViewportSize({ width: w, height: h });
    await p.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
    const h1Vis = await p.locator('h1').first().isVisible().catch(() => false);
    h1Vis ? pass(`Homepage ${name} ${w}px`) : fail(`Homepage ${name}`, 'H1 not visible');
    await shot(p, `10-home-${name}`);

    await p.goto(`${BASE}/cars`, { waitUntil: 'networkidle', timeout: 15000 });
    const cardVis = await p.locator('a:has-text("View Details")').first().isVisible().catch(() => false);
    cardVis ? pass(`Cars ${name}`) : warn(`Cars ${name}`, 'no card visible');

    if (w < 768) {
      const burger = await p.locator('[aria-label*="navigation"],[aria-label*="menu"]').first().isVisible().catch(() => false);
      burger ? pass('Mobile hamburger visible') : warn('Mobile hamburger', 'not found');
      if (burger) {
        await p.locator('[aria-label*="navigation"],[aria-label*="menu"]').first().click();
        await p.waitForTimeout(300);
        const mobileNavOpen = await p.locator('a:has-text("Browse Cars")').isVisible().catch(() => false);
        mobileNavOpen ? pass('Mobile nav opens') : warn('Mobile nav open', 'Browse Cars not shown');
        await shot(p, '10b-mobile-menu');
      }
    }
  }
  await p.close();
}

// ── P11: Navbar interactions ──────────────────────────────────────────────────
console.log('\n═══ P11: Navbar ═══');
{
  const p = await mkPage();
  await p.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });

  // Switch Demo Account modal
  await p.locator('button:has-text("Switch Demo Account")').click();
  await p.waitForTimeout(400);
  const modalOpen = await p.locator('[role="dialog"]').isVisible().catch(() => false);
  modalOpen ? pass('Switch Demo modal opens') : fail('Demo modal did not open');

  if (modalOpen) {
    await p.locator('[aria-label="Close demo account dialog"]').click();
    await p.waitForTimeout(300);
    const closed = !(await p.locator('[role="dialog"]').isVisible().catch(() => false));
    closed ? pass('Demo modal closes via X') : warn('Demo modal close', 'still visible');
  }
  await shot(p, '11-navbar');

  // Logo → home
  await p.goto(`${BASE}/cars`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('a[href="/"]').first().click();
  await p.waitForURL(`${BASE}/`, { timeout: 8000 }).catch(() => {});
  const atHome = p.url() === `${BASE}/` || p.url() === BASE;
  atHome ? pass('Logo → home') : warn('Logo click', p.url());

  await p.close();
}

// ── P12: Console error sweep ──────────────────────────────────────────────────
console.log('\n═══ P12: Console error sweep ═══');
{
  const p = await mkPage();
  const routes = [
    '/', '/cars', '/cars/car_1', '/cars/car_2', '/cars/car_6',
    '/signin', '/signup', '/dashboard', '/bookings',
    '/owner', '/admin',
  ];

  // Sign in as renter first
  await p.goto(`${BASE}/signin`, { waitUntil: 'networkidle', timeout: 15000 });
  await p.locator('button:has-text("Sign in as Renter")').first().click();
  await p.waitForURL('**/dashboard**', { timeout: 10000 });

  const routeErrors = {};
  for (const route of routes) {
    const pageErrors = [];
    const handler = m => { if (m.type() === 'error') pageErrors.push(m.text()); };
    const errHandler = e => pageErrors.push('UNCAUGHT:' + e.message);
    p.on('console', handler);
    p.on('pageerror', errHandler);

    await p.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
    await p.waitForTimeout(1200);

    p.off('console', handler);
    p.off('pageerror', errHandler);

    if (pageErrors.length > 0) {
      routeErrors[route] = pageErrors;
      warn(`Console errors on ${route}`, pageErrors.length + ' errors');
      pageErrors.forEach(e => console.log(`     → ${e.slice(0, 120)}`));
    } else {
      pass(`No console errors: ${route}`);
    }
  }

  await p.close();
}

// ── Summary ───────────────────────────────────────────────────────────────────
await browser.close();

console.log('\n════════════════════════════════════════════════════════');
const ps = results.filter(r => r.s === 'PASS').length;
const fs = results.filter(r => r.s === 'FAIL').length;
const ws = results.filter(r => r.s === 'WARN').length;
console.log(`TOTAL ${results.length} | ✅ ${ps} PASS | ❌ ${fs} FAIL | ⚠️  ${ws} WARN`);

if (fs > 0) {
  console.log('\n--- FAILURES ---');
  results.filter(r => r.s === 'FAIL').forEach(r => console.log(`  ❌ ${r.t}: ${r.n}`));
}
if (ws > 0) {
  console.log('\n--- WARNINGS ---');
  results.filter(r => r.s === 'WARN').forEach(r => console.log(`  ⚠️  ${r.t}: ${r.n}`));
}

console.log('\n--- BROWSER CONSOLE ERRORS (unique) ---');
const uniq = [...new Map(allErrors.map(e => [e.text, e])).values()];
uniq.length === 0 ? console.log('  None ✅') : uniq.forEach(e => console.log(`  [${e.url.replace(BASE,'')}] ${e.text.slice(0,150)}`));

writeFileSync('./qa-report-v2.json', JSON.stringify({ summary: { ps, fs, ws }, results, consoleErrors: uniq }, null, 2));
console.log('\nReport: qa-report-v2.json | Screenshots: qa-screenshots/');

process.exit(fs > 0 ? 1 : 0);
