export type Produkt = {
  id: number;
  nazwa: string;
  kupione: boolean;
  ilosc: number;
  jednostka: string;
  kategoria: string;
};

export type Sklep = {
  name: string;
  color: string;
};

export type Sekcja = {
  title: string;
  data: Produkt[];
};
