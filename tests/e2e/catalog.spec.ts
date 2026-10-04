import { expect, test } from './fixtures';

test.describe('Katalog', () => {
  test('pokazuje wszystkie produkty', async ({ api, catalog }) => {
    await catalog.goto();
    await expect(catalog.products).toHaveCount(9);
  });

  test('wyszukuje produkt po nazwie', async ({ api, catalog }) => {
    await catalog.goto();
    await catalog.searchFor('Kolumbia');
    await expect(catalog.products).toHaveCount(1);
  });

  test('produkt bez stanu ma nieaktywny przycisk', async ({ api, catalog }) => {
    await catalog.goto();
    await expect(catalog.product('Drip Kenia').getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  });

  test('niezalogowany klient po dodaniu produktu trafia na stronę logowania', async ({ api, page, catalog, loginPage }) => {
    await catalog.goto();
    await catalog.addToCart('Etiopia Yirgacheffe');
    await expect(page).toHaveURL(/\/login\?next=\/$/);
    await expect(loginPage.email).toBeVisible();
  });
});
