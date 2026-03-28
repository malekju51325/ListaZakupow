import React, { createContext, useContext, useState } from "react";

type Produkt = {
    id: number;
    nazwa: string;
    cena: number;
    kupione: boolean;
};

type Sekcja = {
    title: string;
    data: Produkt[];
};

type ShoppingContextType = {
    dane: Sekcja[];
    dodajProdukt: (nazwa: string, sklep: string, cena: number) => void;
    usunProdukt: (produkt: Produkt, sklep: string) => void;
    toggleKupione: (produkt: Produkt, sklep: string) => void;
};

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
    const [dane, setDane] = useState<Sekcja[]>([
        {
            title: "Biedronka",
            data: [
               { id: 1, nazwa: "Mleko", cena: 3, kupione: false },
               { id: 2, nazwa: "Chleb", cena: 4, kupione: false }
            ]
        }
    ]);

    function dodajProdukt(nazwa: string, sklep: string, cena: number) {
        const sekcjaIndex = dane.findIndex(s => s.title === sklep);

        let noweDane: Sekcja[];

        if (sekcjaIndex !== -1) {
            noweDane = dane.map((sekcja, index) =>
                index === sekcjaIndex
                    ? { ...sekcja, data: [{ id: Date.now(), nazwa, cena, kupione: false }, ...sekcja.data] }
                    : sekcja
            );
        } else {
            noweDane = [...dane, { title: sklep, data: [{ id: Date.now(), nazwa, cena, kupione: false }] }];
        }

        setDane(noweDane);
    }

    function usunProdukt(produkt: Produkt, sklep: string) {
        const noweDane = dane
            .map(sekcja => {
                if (sekcja.title !== sklep) return sekcja;

                return {
                    ...sekcja,
                    data: sekcja.data.filter(p => p.id !== produkt.id)
                };
            })
            .filter(sekcja => sekcja.data.length > 0);

        setDane(noweDane);
    }

    function toggleKupione(produkt: Produkt, sklep: string) {
        const noweDane = dane.map(sekcja => {
            if (sekcja.title !== sklep) return sekcja;

            const noweProdukty = sekcja.data.map(p =>
                p.id === produkt.id ? { ...p, kupione: !p.kupione } : p
            );

            noweProdukty.sort((a, b) => Number(a.kupione) - Number(b.kupione));

            return { ...sekcja, data: noweProdukty };
        });

        setDane(noweDane);
    }

    return (
        <ShoppingContext.Provider value={{ dane, dodajProdukt, usunProdukt, toggleKupione }}>
            {children}
        </ShoppingContext.Provider>
    );
}

export function useShopping() {
    const context = useContext(ShoppingContext);
    if (!context) throw new Error("useShopping must be used inside ShoppingProvider");
    return context;
}