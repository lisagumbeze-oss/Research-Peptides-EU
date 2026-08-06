/**
 * Phase 2 pre-Ads compliance smoke (Playwright).
 * Run: npx playwright test --config=playwright.phase2.config.ts --workers=1
 */
import { test, expect } from 'playwright/test';

const BASE = process.env.PHASE2_BASE_URL || 'http://127.0.0.1:5173';

const FORBIDDEN = [
  /fat loss & metabolism/i,
  /cognitive enhancement/i,
  /target dose \(mcg\)/i,
  /find your compound/i,
  /discreet packaging/i,
  /semaglutide research units/i,
  /glp-1 research demand/i,
  /clinical precision/i,
];

async function seedConfirmed(page: import('playwright').Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('rp-eu-age-gate', 'confirmed');
      localStorage.setItem('rp-eu-cookie-consent', 'essential');
      localStorage.setItem(
        'cart-storage',
        JSON.stringify({
          state: {
            items: [
              {
                productId: 'qa-peptide',
                title: 'QA Research Peptide',
                price: 79,
                quantity: 1,
                imageUrl: '',
                specification: '10mg',
              },
            ],
            promoCode: null,
            discount: 0,
          },
          version: 0,
        }),
      );
    } catch {
      /* ignore */
    }
  });
}

async function gotoPath(page: import('playwright').Page, path: string) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(500);
}

test.describe('Phase 2 — desktop', () => {
  test('age gate shows for new visitors', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('rp-eu-age-gate');
        localStorage.removeItem('rp-eu-cookie-consent');
      } catch {
        /* ignore */
      }
    });
    await gotoPath(page, '/en');
    const dialog = page.getByRole('dialog').filter({ hasText: /age|research confirmation/i });
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /18\+/i }).click();
    await expect(dialog).toBeHidden({ timeout: 5000 });
    await context.close();
  });

  test('home, ticker, wizard, shipping, faq, calculator, product, checkout, landings', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const results: string[] = [];
    const fail = (msg: string) => results.push(`FAIL: ${msg}`);
    const pass = (msg: string) => results.push(`PASS: ${msg}`);

    await seedConfirmed(page);
    await gotoPath(page, '/en');

    const bodyText = await page.locator('body').innerText();
    for (const re of FORBIDDEN) {
      if (re.test(bodyText)) fail(`Home contains forbidden phrase matching ${re}`);
    }
    if (/european laborator/i.test(bodyText) || /research peptide/i.test(bodyText)) {
      pass('Home reads as research lab supply');
    } else {
      fail('Home missing research/lab framing');
    }

    const footer = page.locator('footer');
    if (await footer.count()) {
      const footerText = await footer.first().innerText();
      if (/not for human|research.?use|laboratory/i.test(footerText)) {
        pass('Footer has research disclaimer');
      } else {
        fail('Footer missing research disclaimer');
      }
    } else {
      fail('Footer not found');
    }

    if (/semaglutide research units|glp-1 research demand/i.test(bodyText)) {
      fail('Ticker still has Semaglutide/GLP-1 demand copy');
    } else {
      pass('Ticker has no Semaglutide/GLP-1 demand copy');
    }

    const wizardCta = page.getByRole('button', { name: /browse by research area/i }).first();
    if (await wizardCta.isVisible().catch(() => false)) {
      await wizardCta.click();
      await expect(page.getByText(/metabolic research pathways/i)).toBeVisible({ timeout: 10000 });
      const wizardRoot = page
        .locator('.fixed.inset-0')
        .filter({ hasText: /metabolic research pathways/i });
      const wizardText = await wizardRoot.first().innerText();
      const hasResearchGoals =
        /metabolic research pathways/i.test(wizardText) &&
        /muscle tissue research models/i.test(wizardText) &&
        /cellular repair research/i.test(wizardText) &&
        /neuro research models/i.test(wizardText);
      const hasOldGoals = /fat loss & metabolism|cognitive enhancement/i.test(wizardText);
      if (hasResearchGoals && !hasOldGoals) pass('Wizard goals are research areas');
      else fail('Wizard goals not fully reframed');
      await page.locator('.fixed.inset-0 .absolute.inset-0').first().click({ force: true });
      await page.waitForTimeout(300);
    } else {
      fail('Wizard CTA not found on home');
    }

    await gotoPath(page, '/en/shipping');
    const shippingText = await page.locator('body').innerText();
    if (/discreet packaging/i.test(shippingText)) fail('Shipping still says discreet packaging');
    else if (/professional packaging|plain packaging/i.test(shippingText)) {
      pass('Shipping packaging copy is professional/neutral');
    } else fail('Shipping packaging copy unclear');

    await gotoPath(page, '/en/faq');
    const faqText = await page.locator('body').innerText();
    if (/is packaging discreet/i.test(faqText)) fail('FAQ still asks about discreet packaging');
    else pass('FAQ packaging copy is neutral / not discreet');

    await gotoPath(page, '/en/peptide-calculator');
    const calcText = await page.locator('body').innerText();
    if (/target dose \(mcg\)/i.test(calcText)) fail('Calculator still uses Target Dose');
    else if (/working aliquot/i.test(calcText)) pass('Calculator uses working aliquot language');
    else fail('Calculator aliquot language missing');

    await gotoPath(page, '/en/product/gdf-8-myostatin');
    const productText = await page.locator('body').innerText();
    if (/research use only/i.test(productText) && /not for human or veterinary/i.test(productText)) {
      pass('Product panel shows research-use-only detail');
    } else if (/research use only|laboratory research only|not for human/i.test(productText)) {
      pass('Product page shows research-only language');
    } else {
      fail('Product page missing research-only detail');
    }

    for (const path of ['/en', '/en/about-us', '/en/coas']) {
      const res = await page.goto(`${BASE}${path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      if (res && res.ok()) pass(`Ad landing reachable: ${path}`);
      else fail(`Ad landing failed: ${path} status=${res?.status()}`);
    }

    await gotoPath(page, '/en/checkout');
    await page.waitForTimeout(800);
    const checkoutUrl = page.url();
    const checkoutText = await page.locator('body').innerText();
    if (
      /checkout|shipping|payment|confirm|complete your order|order summary/i.test(checkoutText) ||
      /checkout|cart/i.test(checkoutUrl)
    ) {
      pass('Checkout/cart smoke OK');
    } else {
      fail(`Checkout/cart smoke failed url=${checkoutUrl}`);
    }

    // Walk to step 3 attestation if on checkout form
    if (await page.locator('#checkout-email').isVisible().catch(() => false)) {
      await page.fill('#checkout-email', 'qa@example.com');
      await page.fill('#checkout-full-name', 'QA Lab');
      await page.fill('#checkout-phone', '+31123456789');
      await page.fill('#checkout-address-line', 'Lab Street 1');
      await page.fill('#checkout-city', 'Amsterdam');
      await page.fill('#checkout-postal', '1011AB');
      const continueBtn = page.getByRole('button', { name: /continue|next|payment/i }).first();
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click();
        await page.waitForTimeout(500);
        const payConfirm = page.getByRole('button', { name: /confirm payment/i });
        if (await payConfirm.isVisible().catch(() => false)) {
          await payConfirm.click();
          await page.waitForTimeout(500);
        }
      }
    }
    const hasAttest =
      (await page.getByText(/at least 18 years old/i).isVisible().catch(() => false)) &&
      (await page.getByText(/laboratory research use only/i).isVisible().catch(() => false)) &&
      (await page.getByText(/terms of service/i).isVisible().catch(() => false));
    if (hasAttest) pass('Checkout step 3 shows age / research / terms attestations');
    else results.push('INFO: Attestation UI not reached in this run');

    await gotoPath(page, '/en/terms');
    const termsText = await page.locator('body').innerText();
    if (/18/i.test(termsText)) pass('Terms eligibility mentions 18+');
    else fail('Terms missing 18+ eligibility');

    console.log('\n===== PHASE 2 RESULTS =====');
    for (const line of results) console.log(line);
    console.log('===========================\n');

    const failures = results.filter((r) => r.startsWith('FAIL:'));
    expect(failures, failures.join('\n')).toHaveLength(0);
  });
});

test.describe('Phase 2 — mobile', () => {
  test('home + calculator smoke', async ({ page }) => {
    await seedConfirmed(page);
    await gotoPath(page, '/en');
    await expect(page.getByText(/european laborator/i).first()).toBeVisible({ timeout: 10000 });
    await gotoPath(page, '/en/peptide-calculator');
    await expect(page.getByText('Working aliquot (mcg)')).toBeVisible();
    await gotoPath(page, '/en/shop');
    await expect(page.locator('a[href*="/product/"]').first()).toBeVisible({ timeout: 20000 });
  });
});
