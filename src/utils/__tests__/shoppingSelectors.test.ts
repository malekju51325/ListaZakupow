import { Sekcja } from '@/types/shopping';
import {
  buildShoppingSections,
  filterShoppingData,
  groupProductsByCategory,
  isShoppingSearchActive,
  normalizeSearchQuery,
} from '../shoppingSelectors';

const shoppingData: Sekcja[] = [
  {
    title: 'Biedronka',
    data: [
      {
        id: 1,
        nazwa: 'Mleko',
        kupione: false,
        ilosc: 1,
        jednostka: 'szt',
        kategoria: 'Nabiał',
      },
      {
        id: 2,
        nazwa: 'Chleb',
        kupione: true,
        ilosc: 2,
        jednostka: 'szt',
        kategoria: 'Pieczywo',
      },
    ],
  },
  {
    title: 'Lidl',
    data: [
      {
        id: 3,
        nazwa: 'Jabłka',
        kupione: false,
        ilosc: 500,
        jednostka: 'kg',
        kategoria: 'Owoce',
      },
      {
        id: 4,
        nazwa: 'Mleczna czekolada',
        kupione: false,
        ilosc: 1,
        jednostka: 'op.',
        kategoria: '',
      },
    ],
  },
];

describe('shoppingSelectors', () => {
  it('normalizuje tekst wyszukiwania', () => {
    expect(normalizeSearchQuery('  MLEKO  ')).toBe('mleko');
  });

  it('rozpoznaje aktywne wyszukiwanie tylko dla niepustego tekstu', () => {
    expect(isShoppingSearchActive('   ')).toBe(false);
    expect(isShoppingSearchActive('chleb')).toBe(true);
  });

  it('zwraca oryginalne dane, gdy wyszukiwanie jest puste', () => {
    expect(filterShoppingData(shoppingData, '')).toBe(shoppingData);
  });

  it('filtruje produkty po nazwie bez uwzględniania wielkości liter', () => {
    const result = filterShoppingData(shoppingData, 'mLE');

    expect(result).toHaveLength(2);
    expect(result[0].data.map((produkt) => produkt.nazwa)).toEqual(['Mleko']);
    expect(result[1].data.map((produkt) => produkt.nazwa)).toEqual([
      'Mleczna czekolada',
    ]);
  });

  it('usuwa sekcje sklepów bez pasujących produktów', () => {
    const result = filterShoppingData(shoppingData, 'jabł');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Lidl');
    expect(result[0].data[0].nazwa).toBe('Jabłka');
  });

  it('buduje sekcję produktów do kupienia razem z nazwą sklepu', () => {
    const [doKupienia] = buildShoppingSections(
      shoppingData,
      { 'Do kupienia': true, Kupione: true },
      false,
    );

    expect(doKupienia.title).toBe('Do kupienia');
    expect(doKupienia.data.map((produkt) => produkt.nazwa)).toEqual([
      'Mleko',
      'Jabłka',
      'Mleczna czekolada',
    ]);
    expect(doKupienia.data.map((produkt) => produkt.sklep)).toEqual([
      'Biedronka',
      'Lidl',
      'Lidl',
    ]);
  });

  it('buduje sekcję kupionych produktów', () => {
    const [, kupione] = buildShoppingSections(
      shoppingData,
      { 'Do kupienia': true, Kupione: true },
      false,
    );

    expect(kupione.title).toBe('Kupione');
    expect(kupione.data).toHaveLength(1);
    expect(kupione.data[0].nazwa).toBe('Chleb');
  });

  it('ukrywa zwinięte sekcje, gdy nie trwa wyszukiwanie', () => {
    const sections = buildShoppingSections(
      shoppingData,
      { 'Do kupienia': false, Kupione: false },
      false,
    );

    expect(sections[0].data).toEqual([]);
    expect(sections[1].data).toEqual([]);
  });

  it('pokazuje dane ze zwiniętych sekcji podczas wyszukiwania', () => {
    const sections = buildShoppingSections(
      shoppingData,
      { 'Do kupienia': false, Kupione: false },
      true,
    );

    expect(sections[0].data).toHaveLength(3);
    expect(sections[1].data).toHaveLength(1);
  });

  it('grupuje tylko niekupione produkty według kategorii i dodaje kategorię Inne', () => {
    const result = groupProductsByCategory(shoppingData.flatMap((s) => s.data));

    expect(Object.keys(result)).toEqual(['Nabiał', 'Owoce', 'Inne']);
    expect(result.Nabiał.map((produkt) => produkt.nazwa)).toEqual(['Mleko']);
    expect(result.Owoce.map((produkt) => produkt.nazwa)).toEqual(['Jabłka']);
    expect(result.Inne.map((produkt) => produkt.nazwa)).toEqual([
      'Mleczna czekolada',
    ]);
  });
});
