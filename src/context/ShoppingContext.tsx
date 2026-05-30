import {
  loadShoppingData,
  saveCategories,
  saveShoppingList,
  saveShops,
} from '@/services/shoppingStorage';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SHOPS,
} from '@/constants/shoppingDefaults';
import { Produkt, Sekcja, Sklep } from '@/types/shopping';
import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

type ShoppingContextType = {
  dane: Sekcja[];
  isLoading: boolean;
  isSaving: boolean;
  storageError: string | null;
  lastSavedAt: number | null;
  clearStorageError: () => void;
  reloadShoppingData: () => Promise<void>;
  dodajProdukt: (
    nazwa: string,
    sklep: string,
    ilosc: number,
    jednostka: string,
    kategoria: string,
  ) => void;
  usunProdukt: (produkt: Produkt, sklep: string) => void;
  toggleKupione: (produkt: Produkt, sklep: string) => void;
  edytujProdukt: (
    produktId: number,
    obecnySklep: string,
    zmiany: Partial<Pick<Produkt, 'ilosc' | 'kategoria'>> & {
      sklep?: string;
    },
  ) => void;
  zwiekszIlosc: (produkt: Produkt, sklep: string) => void;
  zmniejszIlosc: (produkt: Produkt, sklep: string) => void;
  wyczyscListe: () => void;
  usunKupione: () => void;
  sklepy: Sklep[];
  dodajSklep: (nazwa: string, kolor: string) => Promise<void>;
  usunSklep: (sklep: string) => void;
  kategorie: string[];
  dodajKategorie: (kategoria: string) => Promise<void>;
  usunKategorie: (kategoria: string) => void;
};

const ShoppingContext = createContext<ShoppingContextType | undefined>(
  undefined,
);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [dane, setDane] = useState<Sekcja[]>([]);
  const [sklepy, setSklepy] = useState<Sklep[]>(DEFAULT_SHOPS);
  const [kategorie, setKategorie] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const reloadShoppingData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setStorageError(null);

      const zapisane = await loadShoppingData();

      if (zapisane.sklepy) {
        setSklepy(zapisane.sklepy);
      }

      if (zapisane.kategorie) {
        setKategorie(zapisane.kategorie);
      }

      if (zapisane.dane) {
        setDane(zapisane.dane);
      } else {
        setDane([]);
      }
    } catch (e) {
      console.log('Błąd wczytywania:', e);
      setStorageError('Nie udało się wczytać danych.');
      Alert.alert('Błąd', 'Nie udało się wczytać danych.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Context jest jedynym miejscem hydratacji danych, żeby ekrany nie musiały znać AsyncStorage.
    reloadShoppingData();
  }, [reloadShoppingData]);

  // Jeden wrapper daje ten sam feedback dla każdego zapisu do pamięci telefonu.
  async function wykonajZapis(akcja: () => Promise<void>, komunikat: string) {
    try {
      setIsSaving(true);
      setStorageError(null);
      await akcja();
      setLastSavedAt(Date.now());
    } catch (e) {
      console.log('Błąd zapisu:', e);
      setStorageError(komunikat);
      Alert.alert('Błąd', komunikat);
    } finally {
      setIsSaving(false);
    }
  }

  async function zapiszDane(noweDane: Sekcja[]) {
    await wykonajZapis(
      () => saveShoppingList(noweDane),
      'Nie udało się zapisać danych.',
    );
  }

  async function zapiszSklepy(noweSklepy: Sklep[]) {
    await wykonajZapis(
      () => saveShops(noweSklepy),
      'Nie udało się zapisać sklepów.',
    );
  }

  async function zapiszKategorie(noweKategorie: string[]) {
    await wykonajZapis(
      () => saveCategories(noweKategorie),
      'Nie udało się zapisać kategorii.',
    );
  }

  function dodajProdukt(
    nazwa: string,
    sklep: string,
    ilosc: number,
    jednostka: string,
    kategoria: string,
  ) {
    const sekcjaIndex = dane.findIndex((s) => s.title === sklep);

    let noweDane: Sekcja[];
    if (!sklep) {
      alert('Wybierz sklep');
      return;
    }
    if (sekcjaIndex !== -1) {
      noweDane = dane.map((sekcja, index) =>
        index === sekcjaIndex
          ? {
              ...sekcja,
              data: [
                {
                  id: Date.now(),
                  nazwa,
                  ilosc,
                  jednostka,
                  kategoria,
                  kupione: false,
                },
                ...sekcja.data,
              ],
            }
          : sekcja,
      );
    } else {
      noweDane = [
        ...dane,
        {
          title: sklep,
          data: [
            {
              id: Date.now(),
              nazwa,
              ilosc,
              jednostka,
              kategoria,
              kupione: false,
            },
          ],
        },
      ];
    }

    setDane(noweDane);
    zapiszDane(noweDane);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function usunProdukt(produkt: Produkt, sklep: string) {
    const noweDane = dane
      .map((sekcja) => {
        if (sekcja.title !== sklep) return sekcja;

        return {
          ...sekcja,
          data: sekcja.data.filter((p) => p.id !== produkt.id),
        };
      })
      .filter((sekcja) => sekcja.data.length > 0);

    setDane(noweDane);
    zapiszDane(noweDane);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  function toggleKupione(produkt: Produkt, sklep: string) {
    const noweDane = dane.map((sekcja) => {
      if (sekcja.title !== sklep) return sekcja;

      const noweProdukty = sekcja.data.map((p) =>
        p.id === produkt.id ? { ...p, kupione: !p.kupione } : p,
      );

      noweProdukty.sort((a, b) => Number(a.kupione) - Number(b.kupione));

      return { ...sekcja, data: noweProdukty };
    });

    setDane(noweDane);
    zapiszDane(noweDane);

    Haptics.selectionAsync();
  }

  function edytujProdukt(
    produktId: number,
    obecnySklep: string,
    zmiany: Partial<Pick<Produkt, 'ilosc' | 'kategoria'>> & {
      sklep?: string;
    },
  ) {
    let przenoszonyProdukt: Produkt | null = null;
    const docelowySklep = zmiany.sklep ?? obecnySklep;

    const daneBezProduktu = dane
      .map((sekcja) => {
        const produkt = sekcja.data.find((p) => p.id === produktId);

        if (sekcja.title === obecnySklep && produkt) {
          przenoszonyProdukt = {
            ...produkt,
            ilosc: zmiany.ilosc ?? produkt.ilosc,
            kategoria: zmiany.kategoria ?? produkt.kategoria,
          };
        }

        return {
          ...sekcja,
          data: sekcja.data.filter((p) => p.id !== produktId),
        };
      })
      .filter((sekcja) => sekcja.data.length > 0);

    if (!przenoszonyProdukt) return;

    const sekcjaDocelowaIstnieje = daneBezProduktu.some(
      (sekcja) => sekcja.title === docelowySklep,
    );

    const noweDane = sekcjaDocelowaIstnieje
      ? daneBezProduktu.map((sekcja) =>
          sekcja.title === docelowySklep
            ? {
                ...sekcja,
                data: [przenoszonyProdukt as Produkt, ...sekcja.data],
              }
            : sekcja,
        )
      : [
          ...daneBezProduktu,
          {
            title: docelowySklep,
            data: [przenoszonyProdukt],
          },
        ];

    setDane(noweDane);
    zapiszDane(noweDane);
    Haptics.selectionAsync();
  }

  function zwiekszIlosc(produkt: Produkt, sklep: string) {
    const krok = produkt.jednostka === 'kg' ? 50 : 1;

    const noweDane = dane.map((sekcja) => {
      if (sekcja.title !== sklep) return sekcja;

      const noweProdukty = sekcja.data.map((p) =>
        p.id === produkt.id ? { ...p, ilosc: p.ilosc + krok } : p,
      );

      return { ...sekcja, data: noweProdukty };
    });

    setDane(noweDane);
    zapiszDane(noweDane);
  }

  function zmniejszIlosc(produkt: Produkt, sklep: string) {
    const krok = produkt.jednostka === 'kg' ? 50 : 1;
    const minimum = produkt.jednostka === 'kg' ? 50 : 1;

    const noweDane = dane.map((sekcja) => {
      if (sekcja.title !== sklep) return sekcja;

      const noweProdukty = sekcja.data.map((p) =>
        p.id === produkt.id
          ? { ...p, ilosc: Math.max(minimum, p.ilosc - krok) }
          : p,
      );

      return { ...sekcja, data: noweProdukty };
    });

    setDane(noweDane);
    zapiszDane(noweDane);
  }

  function wyczyscListe() {
    const noweDane: Sekcja[] = [];
    setDane(noweDane);
    zapiszDane(noweDane);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  function usunKupione() {
    const noweDane = dane
      .map((sekcja) => ({
        ...sekcja,
        data: sekcja.data.filter((produkt) => !produkt.kupione),
      }))
      .filter((sekcja) => sekcja.data.length > 0);

    setDane(noweDane);
    zapiszDane(noweDane);
  }

  async function dodajSklep(nazwa: string, kolor: string) {
    const noweSklepy = [
      ...sklepy,
      {
        name: nazwa,
        color: kolor,
      },
    ];

    setSklepy(noweSklepy);
    await zapiszSklepy(noweSklepy);
  }

  async function dodajKategorie(kategoria: string) {
    const noweKategorie = [...kategorie, kategoria];

    setKategorie(noweKategorie);
    await zapiszKategorie(noweKategorie);
  }

  function usunKategorie(kategoria: string) {
    const noweKategorie = kategorie.filter((k) => k !== kategoria);
    const noweDane = dane.map((sekcja) => ({
      ...sekcja,
      data: sekcja.data.map((produkt) =>
        produkt.kategoria === kategoria
          ? { ...produkt, kategoria: '' }
          : produkt,
      ),
    }));

    setKategorie(noweKategorie);
    setDane(noweDane);
    zapiszKategorie(noweKategorie);
    zapiszDane(noweDane);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  function usunSklep(sklep: string) {
    const noweSklepy = sklepy.filter((s) => s.name !== sklep);

    setSklepy(noweSklepy);
    zapiszSklepy(noweSklepy);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }

  return (
    <ShoppingContext.Provider
      value={{
        dane,
        isLoading,
        isSaving,
        storageError,
        lastSavedAt,
        clearStorageError: () => setStorageError(null),
        reloadShoppingData,
        dodajProdukt,
        usunProdukt,
        toggleKupione,
        edytujProdukt,
        zwiekszIlosc,
        zmniejszIlosc,
        wyczyscListe,
        usunKupione,
        sklepy,
        dodajSklep,
        usunSklep,
        kategorie,
        dodajKategorie,
        usunKategorie,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const context = useContext(ShoppingContext);
  if (!context)
    throw new Error('useShopping must be used inside ShoppingProvider');
  return context;
}
