import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

type Produkt = {
  id: number;
  nazwa: string;
  kupione: boolean;
  ilosc: number;
  jednostka: string;
  kategoria: string;

};

type Sklep = {
  name: string;
  color: string;
};


type Sekcja = {
  title: string;
  data: Produkt[];
};

type ShoppingContextType = {
  dane: Sekcja[];
  dodajProdukt: (nazwa: string, sklep: string, ilosc: number, jednostka: string,
    kategoria: string) => void;
  usunProdukt: (produkt: Produkt, sklep: string) => void;
  toggleKupione: (produkt: Produkt, sklep: string) => void;
  zwiekszIlosc: (produkt: Produkt, sklep: string) => void;
  zmniejszIlosc: (produkt: Produkt, sklep: string) => void;
  wyczyscListe: () => void;
  usunKupione: () => void;
  sklepy: Sklep[];
  setSklepy: React.Dispatch<React.SetStateAction<Sklep[]>>;
  kategorie: string[];
  setKategorie: React.Dispatch<React.SetStateAction<string[]>>;
};

const ShoppingContext = createContext<ShoppingContextType | undefined>(
  undefined,
);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {

  const [dane, setDane] = useState<Sekcja[]>([]);
  const [sklepy, setSklepy] = useState<Sklep[]>([
    { name: "Biedronka", color: "#C54B3D" },
    { name: "Lidl", color: "#3178C6" },
  ]);

  const [kategorie, setKategorie] = useState<string[]>([
    "Nabiał",
    "Pieczywo",
    "Warzywa",
  ]);

  useEffect(() => {
    const wczytaj = async () => {
      try {
        const zapisane = await AsyncStorage.getItem('listaZakupow');
        const zapisaneSklepy = await AsyncStorage.getItem('sklepy');
        const zapisaneKategorie = await AsyncStorage.getItem('kategorie');

        if (zapisaneSklepy) {
          setSklepy(JSON.parse(zapisaneSklepy));
        }

        if (zapisaneKategorie) {
          setKategorie(JSON.parse(zapisaneKategorie));
        }

        if (zapisane) {
          setDane(JSON.parse(zapisane));
        } else {
          setDane([]);
        }
      } catch (e) {
        console.log('Błąd wczytywania:', e);
        Alert.alert('Błąd', 'Nie udało się wczytać danych.');
      }
    };

    wczytaj();
  }, []);


  async function zapiszDane(noweDane: Sekcja[]) {
    try {
      await AsyncStorage.setItem('listaZakupow', JSON.stringify(noweDane));
    } catch (e) {
      console.log('Błąd zapisu:', e);
      Alert.alert('Błąd', 'Nie udało się zapisać danych.');
    }
  }

  async function zapiszSklepy(noweSklepy: Sklep[]) {
    try {
      await AsyncStorage.setItem('sklepy', JSON.stringify(noweSklepy));
    } catch (e) {
      console.log('Błąd zapisu sklepów:', e);
    }
  }

  async function zapiszKategorie(noweKategorie: string[]) {
    try {
      await AsyncStorage.setItem('kategorie', JSON.stringify(noweKategorie));
    } catch (e) {
      console.log('Błąd zapisu kategorii:', e);
    }
  }

  function dodajProdukt(nazwa: string, sklep: string, ilosc: number, jednostka: string,
    kategoria: string) {
    const sekcjaIndex = dane.findIndex((s) => s.title === sklep);

    let noweDane: Sekcja[];
    if (!sklep) {
      alert("Wybierz sklep");
      return;
    }
    if (sekcjaIndex !== -1) {
      noweDane = dane.map((sekcja, index) =>
        index === sekcjaIndex
          ? {
            ...sekcja,
            data: [
              {
                id: Date.now(), nazwa, ilosc, jednostka,
                kategoria, kupione: false
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
          data: [{
            id: Date.now(), nazwa, ilosc, jednostka,
            kategoria, kupione: false
          }],
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

  function zwiekszIlosc(produkt: Produkt, sklep: string) {
    const noweDane = dane.map((sekcja) => {
      if (sekcja.title !== sklep) return sekcja;

      const noweProdukty = sekcja.data.map((p) =>
        p.id === produkt.id ? { ...p, ilosc: p.ilosc + 1 } : p
      );

      return { ...sekcja, data: noweProdukty };
    });

    setDane(noweDane);
    zapiszDane(noweDane);
  }

  function zmniejszIlosc(produkt: Produkt, sklep: string) {
    const noweDane = dane.map((sekcja) => {
      if (sekcja.title !== sklep) return sekcja;

      const noweProdukty = sekcja.data.map((p) =>
        p.id === produkt.id
          ? { ...p, ilosc: Math.max(1, p.ilosc - 1) }
          : p
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


  return (
    <ShoppingContext.Provider
      value={{
        dane,
        dodajProdukt,
        usunProdukt,
        toggleKupione,
        zwiekszIlosc,
        zmniejszIlosc,
        wyczyscListe,
        usunKupione,
        sklepy,
        setSklepy,
        kategorie,
        setKategorie,
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