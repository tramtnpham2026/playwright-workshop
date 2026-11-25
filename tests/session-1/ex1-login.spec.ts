import { test, expect } from '@playwright/test';

// Exercise 1 — Login
// Manual test case:
//   1. Open the login page (/auth/login)
//   2. Enter email customer@practicesoftwaretesting.com and password welcome01
//   3. Click "Login"
//   Expected: the "My account" page is shown
//
// Change test.fixme to test, then write the steps.
// Tip: both fields have proper labels — start at the top of the locator ladder.
//      Pick locator in UI mode shows you what Playwright suggests.

test('customer can log in and sees their account page', async ({ page }) => {
  // TODO 1: open the login page
  await page.goto('/auth/login');

  // TODO 2: fill in email and password
  await page.getByLabel('Email address *').fill('admin@practicesoftwaretesting.com');
  //await page.getByRole('textbox', { name: 'Password' }).fill('welcome01');
  await page.getByLabel('Password *').fill('welcome01');


  // TODO 3: click the Login button
  await page.getByRole('button', { name: 'Login' }).click();

  // TODO 4: check the result — URL and page heading
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Sales over the years' })).toBeVisible();
});
