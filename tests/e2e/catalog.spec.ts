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

  // Plan: dane: katalog po resecie fixture `api`; kroki UI: otworzyć katalog i wysłać
  // zapytanie przez pole wyszukiwania; asercje: wynik `Kolumbia`, komunikat dla 1 znaku
  // oraz komunikat „Brak produktów spełniających kryteria.” dla pustego wyniku (BR-10).
  const searchCases = [
    { query: 'kolumbia', expectedCount: 1, expectedProduct: 'Kolumbia', bug: 'wielkość liter' },
    { query: 'k', expectedError: 'Wpisz co najmniej 2 znaki' },
    { query: 'ko', expectedCount: 1, expectedProduct: 'Kolumbia', bug: 'wielkość liter' },
    { query: 'xyz', expectedCount: 0, expectedNoResults: 'Brak produktów spełniających kryteria.' },
  ] as const;

  for (const searchCase of searchCases) {
    test(`BR-10 wyszukiwanie dla „${searchCase.query}”`, async ({ catalog }) => {
      if (searchCase.bug) {
        // BUG: wyszukiwanie rozróżnia wielkość liter, BR-10
        test.fail(true, `Implementacja nie spełnia BR-10: ${searchCase.bug}`);
      }

      await catalog.goto();
      await catalog.searchFor(searchCase.query);

      if (searchCase.expectedError) {
        await expect(catalog.searchError).toHaveText(searchCase.expectedError);
        await expect(catalog.noResults).toHaveText('Brak produktów spełniających kryteria.');
      } else if (searchCase.expectedNoResults) {
        await expect(catalog.products).toHaveCount(searchCase.expectedCount);
        await expect(catalog.noResults).toHaveText(searchCase.expectedNoResults);
      } else {
        await expect(catalog.products).toHaveCount(searchCase.expectedCount);
        await expect(catalog.product(searchCase.expectedProduct)).toHaveCount(1);
      }
    });
  }

  test('produkt bez stanu ma nieaktywny przycisk', async ({ api, catalog }) => {
    await catalog.goto();
    await expect(catalog.product('Drip Kenia').getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  });
});
