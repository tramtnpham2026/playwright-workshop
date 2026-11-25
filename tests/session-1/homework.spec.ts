import { test, expect } from '@playwright/test';

// Session 1 homework — see homework/session-1/README.md for the four test cases.
// Write one test per test case below. Submit on branch hw/s1.

test.describe('Session 1 homework', () => {
  test('TC-01 contact form shows validation errors, then accepts a valid message', async ({ page }) => {
    const errors = page.getByRole('alert');
    const sendButton = page.getByRole('button', { name: 'Send' });
    const email = page.getByRole('textbox', { name: 'Email address' });
    const message = page.getByRole('textbox', { name: 'Message' });

    // Step 1: open the home page and go to Contact using the header link
    await page.goto('/');
    await page.getByRole('link', { name: 'Contact' }).click();

    // Step 2: click Send without filling anything in — every required field reports an error
    await sendButton.click();
    await expect(errors).toHaveText([
      'First name is required',
      'Last name is required',
      'Email is required',
      'Subject is required',
      'Message is required',
    ]);

    // Step 3: invalid email and a too-short message — only those two errors remain
    await page.getByRole('textbox', { name: 'First name' }).fill('Jane');
    await page.getByRole('textbox', { name: 'Last name' }).fill('Doe');
    await email.fill('not-an-email');
    await page.getByRole('combobox', { name: 'Subject' }).selectOption('Warranty');
    await message.fill('Too short');
    await sendButton.click();
    await expect(errors).toHaveText([
      'Email format is invalid',
      'Message must be minimal 50 characters',
    ]);

    // Step 4: fix the email and write a message of 50+ characters — the message is accepted
    await email.fill('jane.doe@example.com');
    await message.fill('My hammer broke after two days of normal use. Is this covered by the warranty?');
    // The form re-validates when a field loses focus. Clicking Send straight away removes the two
    // error lines mid-click, the button jumps up and the click is lost — so leave the field first
    // and wait for the errors to clear before clicking.
    await message.press('Tab');
    await expect(errors).toHaveCount(0);
    await sendButton.click();
    await expect(page.getByText('Thanks for your message! We will contact you shortly.')).toBeVisible();
  });

  test('TC-02 cart updates quantities and totals, and can be emptied', async ({ page }) => {
    const cartBadge = page.getByTestId('cart-quantity');
    const cartTotal = page.getByTestId('cart-total');

    // Step 1: find Slip Joint Pliers like a user — look through the product list page by page
    await page.goto('/');
    const productNames = page.getByTestId('product-name');
    // exact: true — otherwise a longer name containing "Slip Joint Pliers" would match too
    const slipJointPliers = page.getByRole('heading', { name: 'Slip Joint Pliers', exact: true });
    const nextPage = page.getByRole('button', { name: 'Next' });
    // Wait for the first page of products before checking it (count() below does not wait)
    await expect(productNames.first()).toBeVisible();
    while ((await slipJointPliers.count()) === 0) {
      // Not on this page: go to the next one. If there is no next page, the product doesn't exist.
      await expect(nextPage, 'Slip Joint Pliers was not found on any page').toBeEnabled();
      const firstNameOnPage = await productNames.first().innerText();
      await nextPage.click();
      // Wait until the next page has replaced the list before checking it again.
      // On the last page "Next" changes nothing, so this fails instead of looping forever.
      await expect(productNames.first()).not.toHaveText(firstNameOnPage);
    }
    await slipJointPliers.click();

    // Step 2: increase the quantity to 3 and add to cart
    await page.getByRole('spinbutton', { name: 'Quantity' }).fill('3');
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByRole('alert', { name: 'Product added to shopping cart.' })).toBeVisible();
    await expect(cartBadge).toHaveText('3');

    // Step 3: open the cart from the header
    await page.getByRole('link', { name: 'cart' }).click();
    const cartRow = page.getByRole('row', { name: /Slip Joint Pliers/ });
    await expect(cartRow.getByTestId('line-price')).toHaveText('$27.51');
    await expect(cartTotal).toHaveText('$27.51');

    // Step 4: change the quantity in the cart to 1 (the update fires when the field loses focus)
    const cartQuantity = page.getByRole('spinbutton', { name: 'Quantity for Slip Joint Pliers' });
    await cartQuantity.fill('1');
    await cartQuantity.press('Tab');
    await expect(page.getByRole('alert', { name: 'Product quantity updated.' })).toBeVisible();
    await expect(cartTotal).toHaveText('$9.17');
    await expect(cartBadge).toHaveText('1');

    // Step 5: remove the item.
    // Locator choice: the remove button is an <a class="btn btn-danger"> holding only an icon —
    // no text, no aria-label, no data-test and no href, so it has no role or accessible name.
    // Pick locator can only offer a CSS/position-based locator. The best we can do is scope it to
    // the product's row (so it can't hit another item's button) and select the <a> element: it is
    // the only <a> in the row, so no styling class (.btn-danger) is needed.
    // The real fix is in the app: give the button an aria-label such as "Remove Slip Joint Pliers".
    await cartRow.locator('a').click();
    await expect(page.getByRole('alert', { name: 'Product deleted.' })).toBeVisible();
    await expect(page.getByText('The cart is empty. Nothing to display.')).toBeVisible();
  });

  test('TC-03 an out-of-stock product cannot be added to the cart', async ({ page }) => {
    // Step 1: open the home page and search for "long nose"
    await page.goto('/');
    // Wait for the initial product list (see TC-02) so it can't overwrite the search results.
    await expect(page.getByTestId('product-name').first()).toBeVisible();
    const searchBox = page.getByRole('textbox', { name: 'Search' });
    await searchBox.fill('long nose');
    await searchBox.press('Enter');
    await expect(page.getByText("1 product found for 'long nose'")).toBeVisible();
    const productCard = page.getByRole('link', { name: /Long Nose Pliers/ });
    await expect(productCard.getByText('Out of stock')).toBeVisible();

    // Step 2: open Long Nose Pliers — none of the buying controls can be used
    await productCard.getByRole('heading', { name: 'Long Nose Pliers', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Long Nose Pliers', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
    await expect(page.getByRole('spinbutton', { name: 'Quantity' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });

  test('TC-04 filtering by Drill and sorting by price lists the drills cheapest first', async ({ page }) => {
    // Why only 2 of the 4 cordless drills? All four are in the Drill category, but the home page's
    // "Price Range" filter defaults to $1–$100. Cordless Drill 18V ($119.24) and 20V ($125.23)
    // cost more than $100, so they are filtered out even though they are drills.

    // Step 1: open the home page
    await page.goto('/');
    // Wait for the initial product list (see TC-02) so it can't overwrite the filtered list.
    await expect(page.getByTestId('product-name').first()).toBeVisible();

    // Step 2: tick the Drill category (exact: true so a "... Drill ..." category can't match too)
    await page.getByRole('checkbox', { name: 'Drill', exact: true }).check();
    // Let the filter finish before sorting: if the sort is changed while the filtered list is still
    // loading, the late filter response replaces the sorted list and the order is lost.
    await expect(page.getByTestId('product-name')).toHaveCount(2);

    // Step 3: sort by price, low to high
    await page.getByRole('combobox', { name: 'sort' }).selectOption('Price (Low - High)');

    // Expected: exactly these 2 products, in this order. toHaveText with an array checks the count,
    // the order and each value, and retries until the sorted list has loaded.
    await expect(page.getByTestId('product-name')).toHaveText(['Cordless Drill 12V', 'Cordless Drill 24V']);
    await expect(page.getByTestId('product-price')).toHaveText(['$46.50', '$66.54']);
  });
});

