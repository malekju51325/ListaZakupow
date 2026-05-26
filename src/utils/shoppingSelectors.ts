import { Produkt, Sekcja } from '@/types/shopping';

export type ProduktZeSklepem = Produkt & {
  sklep: string;
};

export type ShoppingSection = {
  title: string;
  data: ProduktZeSklepem[];
};

export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

export function isShoppingSearchActive(query: string) {
  return normalizeSearchQuery(query).length > 0;
}

export function filterShoppingData(dane: Sekcja[], query: string): Sekcja[] {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return dane;
  }

  return dane
    .map((sekcja) => ({
      ...sekcja,
      data: sekcja.data.filter((produkt) =>
        produkt.nazwa.toLowerCase().includes(normalizedQuery),
      ),
    }))
    .filter((sekcja) => sekcja.data.length > 0);
}

export function buildShoppingSections(
  dane: Sekcja[],
  expandedSections: Record<string, boolean>,
  isSearching: boolean,
): ShoppingSection[] {
  const wszystkieProdukty = dane.flatMap((sekcja) =>
    sekcja.data.map((produkt) => ({
      ...produkt,
      sklep: sekcja.title,
    })),
  );

  const doKupienia = wszystkieProdukty.filter((produkt) => !produkt.kupione);
  const kupione = wszystkieProdukty.filter((produkt) => produkt.kupione);

  return [
    {
      title: 'Do kupienia',
      // Podczas wyszukiwania ignorujemy zwinięcie sekcji, żeby użytkownik zawsze widział trafienia.
      data: isSearching || expandedSections['Do kupienia'] ? doKupienia : [],
    },
    {
      title: 'Kupione',
      data: isSearching || expandedSections['Kupione'] ? kupione : [],
    },
  ];
}

export function groupProductsByCategory(produkty: Produkt[]) {
  return produkty
    .filter((produkt) => !produkt.kupione)
    .reduce<Record<string, Produkt[]>>((acc, produkt) => {
      const key = produkt.kategoria || 'Inne';

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(produkt);

      return acc;
    }, {});
}
