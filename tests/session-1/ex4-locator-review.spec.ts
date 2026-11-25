import { test, expect } from '@playwright/test';

// Exercise 4 — Locator review
// These two tests PASS today, but every locator in them is brittle: CSS paths, classes, ids,
// positions — the kind of thing codegen or a quick copy from DevTools gives you.
//
// Your job:
//   1. Rewrite every locator using the locator ladder:
//      getByRole → getByLabel → getByPlaceholder / getByText → getByTestId → CSS only as a last resort.
//   2. Keep both tests passing (run them before and after).
//   3. If a CSS locator really is the best option somewhere, keep it and add a comment saying why.
//   4. Swap with a neighbour and review each other's version using docs/review-checklist.md.

// test('search for saw shows the two saws', async ({ page }) => {
//   await page.goto('/');

//   await page.locator('form .input-group > input.form-control').fill('saw');
//   await page.locator('form .input-group > button.btn-secondary').click();

//   await expect(page.locator('h3 > span')).toHaveText('saw');
//   await expect(page.locator('.card-title')).toHaveText(['Wood Saw', 'Circular Saw']);
// });

// test('first product page lets you change the quantity', async ({ page }) => {
//   await page.goto('/');

//   await page.locator('div.col-md-9 a.card').nth(0).click();

//   await expect(page.locator('h1')).toContainText('Combination Pliers');
//   await expect(page.locator('#btn-add-to-cart')).toBeEnabled();
//   await page.locator('#btn-increase-quantity').click();
//   await expect(page.locator('input[type=number]')).toHaveValue('2');
// });

test('search for saw shows the two saws', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('textbox', { name: 'Search' }).fill('saw');
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.getByRole('heading', { name: 'Searched for: saw' })).toBeVisible();
  // Product names have no role of their own worth targeting (they are plain card titles),
  // so use the data-test attribute the app provides for them.
  await expect(page.getByTestId('product-name')).toHaveText(['Wood Saw', 'Circular Saw']);
});

test('first product page lets you change the quantity', async ({ page }) => {
  await page.goto('/');

  // Open the first product in the list. Position is the point of this test, so first() is intended;
  // the h1 check below catches it if the first product ever changes.
  await page.getByTestId('product-name').first().click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Combination Pliers');
  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Quantity' })).toHaveValue('2');
});
