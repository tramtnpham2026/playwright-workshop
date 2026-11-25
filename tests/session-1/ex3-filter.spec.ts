import { test, expect } from '@playwright/test';

// Exercise 3 — Filter by category
// Manual test case:
//   1. Open the home page
//   2. Tick the "Hammer" category checkbox in the filters
//   Expected: only hammers are listed
//
// Change test.fixme to test, then write the steps.
// Tip: names match partially by default — a category called "Saw" would also match "Hand Saw".
//      `exact: true` avoids that kind of surprise.
// Ask yourself: would your assertion still pass if the filter did nothing at all?

test('filtering by the Hammer category shows only hammers', async ({ page }) => {
  // TODO 1: open the home page
  await page.goto('/');

  // TODO 2: tick the Hammer category
  await page.getByRole('checkbox', { name: 'Hammer', exact: true }).check();

  // TODO 3: check that every product listed is a hammer, and that the list is not empty
  const productNames = page.getByTestId('product-name');
  await expect(productNames.filter({ hasNotText: /hammer/i })).toHaveCount(0);
  await expect(productNames).not.toHaveCount(0);
});
