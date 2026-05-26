import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sekcja, Sklep } from '@/types/shopping';

const STORAGE_KEYS = {
  shoppingList: 'listaZakupow',
  shops: 'sklepy',
  categories: 'kategorie',
} as const;

type StoredShoppingData = {
  dane: Sekcja[] | null;
  sklepy: Sklep[] | null;
  kategorie: string[] | null;
};

function parseStoredValue<T>(value: string | null): T | null {
  return value ? JSON.parse(value) : null;
}

export async function loadShoppingData(): Promise<StoredShoppingData> {
  // Ładujemy wszystko równolegle, bo lista, sklepy i kategorie są niezależnymi danymi.
  const [zapisane, zapisaneSklepy, zapisaneKategorie] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.shoppingList),
    AsyncStorage.getItem(STORAGE_KEYS.shops),
    AsyncStorage.getItem(STORAGE_KEYS.categories),
  ]);

  return {
    dane: parseStoredValue<Sekcja[]>(zapisane),
    sklepy: parseStoredValue<Sklep[]>(zapisaneSklepy),
    kategorie: parseStoredValue<string[]>(zapisaneKategorie),
  };
}

export async function saveShoppingList(dane: Sekcja[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.shoppingList, JSON.stringify(dane));
}

export async function saveShops(sklepy: Sklep[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.shops, JSON.stringify(sklepy));
}

export async function saveCategories(kategorie: string[]) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.categories,
    JSON.stringify(kategorie),
  );
}
