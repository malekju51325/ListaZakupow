import { useShopping } from "@/context/ShoppingContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { dane, wyczyscListe, usunKupione, sklepy, setSklepy,kategorie,
  setKategorie, } = useShopping();
  const [nowySklep, setNowySklep] = React.useState("");
  const [showAddShop, setShowAddShop] = React.useState(false);
  const [wybranyKolor, setWybranyKolor] = React.useState("#2E9B57");
  const [nowaKategoria, setNowaKategoria] = React.useState("");
const [showAddCategory, setShowAddCategory] = React.useState(false);

  const wszystkieProdukty = dane.flatMap((sekcja) =>
    sekcja.data.map((produkt) => ({
      ...produkt,
      sklep: sekcja.title,
    })),
  );
  const COLORS = [
    "#2E9B57",
    "#3178C6",
    "#F3B64B",
    "#C54B3D",
    "#6A746C",
  ];

  const kupione = wszystkieProdukty.filter((produkt) => produkt.kupione);

  function handleWyczyscListe() {
    if (wszystkieProdukty.length === 0) {
      Alert.alert("Pusta lista", "Nie ma produktów do usunięcia.");
      return;
    }

    Alert.alert(
      "Wyczyść listę",
      "Czy na pewno chcesz usunąć wszystkie produkty?",
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Usuń", style: "destructive", onPress: wyczyscListe },
      ],
    );
  }

  function handleUsunKupione() {
    if (kupione.length === 0) {
      Alert.alert("Brak produktów", 'Nie ma produktów w sekcji "Kupione".');
      return;
    }

    Alert.alert(
      "Usuń kupione",
      'Czy chcesz usunąć wszystkie produkty z sekcji "Kupione"?',
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Usuń", style: "destructive", onPress: usunKupione },
      ],
    );
  }

  async function handleDodajSklep() {
    if (!nowySklep.trim()) {
      alert("Podaj nazwę sklepu");
      return;
    }

    const istnieje = sklepy.find(
      (s) => s.name.toLowerCase() === nowySklep.toLowerCase()
    );

    if (istnieje) {
      alert("Taki sklep już istnieje");
      return;
    }

const nowe = [
  ...sklepy,
  {
    name: nowySklep.trim(),
    color: wybranyKolor,
  },
];

setSklepy(nowe);
await AsyncStorage.setItem('sklepy', JSON.stringify(nowe));

    setNowySklep("");
  }

  async function handleDodajKategorie() {
  if (!nowaKategoria.trim()) {
    alert("Podaj nazwę kategorii");
    return;
  }

  const istnieje = kategorie.find(
    (k) => k.toLowerCase() === nowaKategoria.toLowerCase()
  );

  if (istnieje) {
    alert("Taka kategoria już istnieje");
    return;
  }

  const nowe = [...kategorie, nowaKategoria.trim()];

setKategorie(nowe);
await AsyncStorage.setItem('kategorie', JSON.stringify(nowe));
  setNowaKategoria("");
}

  async function handleUdostepnij() {
    if (wszystkieProdukty.length === 0) {
      Alert.alert("Pusta lista", "Nie ma produktów do udostępnienia.");
      return;
    }

    let tekst = "Lista zakupów:\n\n";

    dane.forEach((sekcja) => {
      if (sekcja.data.length === 0) return;

      tekst += `${sekcja.title.toUpperCase()}\n`;

      sekcja.data.forEach((produkt) => {
        tekst += `- ${produkt.nazwa} x${produkt.ilosc}\n`;
      });

      tekst += "\n";
    });

    try {
      await Share.share({
        message: tekst,
      });
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się udostępnić listy.");
    }
  }

  return (
  <SafeAreaView style={styles.safe}>
<KeyboardAwareScrollView
  contentContainerStyle={styles.container}
  enableOnAndroid={true}
  extraScrollHeight={120}
  extraHeight={150}
  keyboardShouldPersistTaps="handled"
  keyboardOpeningTime={0}
>

    <Text style={styles.title}>Ustawienia</Text>

    {/* AKCJE */}
    <View style={styles.card}>
      <Pressable style={styles.button} onPress={handleUdostepnij}>
        <Text style={styles.buttonText}>Udostępnij listę</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleUsunKupione}>
        <Text style={styles.buttonText}>Usuń kupione</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.deleteButton]}
        onPress={handleWyczyscListe}
      >
        <Text style={[styles.buttonText, styles.deleteButtonText]}>
          Wyczyść listę
        </Text>
      </Pressable>
    </View>

    {/* HEADER SKLEPÓW */}
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Twoje sklepy</Text>

      <Pressable onPress={() => setShowAddShop(!showAddShop)}>
        <Text style={styles.plus}>
          {showAddShop ? "−" : "+"}
        </Text>
      </Pressable>
    </View>

    {/* LISTA SKLEPÓW */}
    <View style={styles.card}>
      {sklepy.map((s) => (
        <View key={s.name} style={styles.shopRow}>
          <View
            style={[
              styles.shopCircle,
              {
                backgroundColor: `${s.color}20`,
                borderColor: s.color,
              },
            ]}
          >
            <Text style={[styles.shopLetter, { color: s.color }]}>
              {s.name[0]}
            </Text>
          </View>

          <Text style={styles.shopName}>{s.name}</Text>
        </View>
      ))}
    </View>

    {/* FORMULARZ – POJAWIA SIĘ PO KLIKNIĘCIU */}
    {showAddShop && (
      <View style={styles.card}>

        <Text style={styles.label}>Nazwa sklepu</Text>
        <TextInput
          value={nowySklep}
          onChangeText={setNowySklep}
          style={styles.input}
        />

        <Text style={styles.label}>Kolor</Text>
        <View style={styles.colorsRow}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setWybranyKolor(c)}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: `${c}20`,
                  borderColor: c,
                  borderWidth: wybranyKolor === c ? 2 : 1,
                },
              ]}
            />
          ))}
        </View>

        <Pressable style={styles.addButton} onPress={handleDodajSklep}>
          <Text style={styles.addButtonText}>Dodaj sklep</Text>
        </Pressable>

      </View>
    )}

    {/* HEADER KATEGORII */}
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Kategorie</Text>

  <Pressable onPress={() => setShowAddCategory(!showAddCategory)}>
    <Text style={styles.plus}>
      {showAddCategory ? "−" : "+"}
    </Text>
  </Pressable>
</View>

{/* LISTA KATEGORII */}
<View style={styles.card}>
  <View style={styles.chipsContainer}>
    {kategorie.map((k) => (
      <View key={k} style={styles.categoryChip}>
        <Text style={styles.categoryChipText}>{k}</Text>
      </View>
    ))}
  </View>
</View>

{/* FORMULARZ KATEGORII */}
{showAddCategory && (
  <View style={styles.card}>
    <Text style={styles.label}>Nazwa kategorii</Text>

    <TextInput
      value={nowaKategoria}
      onChangeText={setNowaKategoria}
      style={styles.input}
    />

    <Pressable style={styles.addButton} onPress={handleDodajKategorie}>
      <Text style={styles.addButtonText}>Dodaj kategorię</Text>
    </Pressable>
  </View>
)}
<View style={{ height: 120 }} />
     </KeyboardAwareScrollView>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },

  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 200,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#162018",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    color: "#6A746C",
    marginBottom: 10,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  button: {
    backgroundColor: "#EAF5EE",
    borderWidth: 1.5,
    borderColor: "#2E9B57",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    alignItems: "center",
  },

  deleteButton: {
    backgroundColor: "#F8ECEA",
    borderColor: "#C54B3D",
  },

  buttonText: {
    color: "#2E9B57",
    fontWeight: "700",
    fontSize: 16,
  },

  deleteButtonText: {
    color: "#C54B3D",
  },

  shopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  shopCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  shopLetter: {
    fontWeight: "600",
    color: "#162018",
  },

  shopName: {
    fontSize: 16,
    color: "#162018",
    fontWeight: "500",
  },

  addButton: {
    backgroundColor: "#2E9B57",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#F7F8F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },

  label: {
    fontSize: 13,
    color: "#6A746C",
    marginBottom: 6,
  },

  colorsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  sectionHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
  marginTop: 10,
},

plus: {
  fontSize: 22,
  fontWeight: "600",
  color: "#2E9B57",
  paddingHorizontal: 10,
},
chipsContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},

categoryChip: {
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 20,
  backgroundColor: "#EAF5EE",
  borderWidth: 1.5,
  borderColor: "#2E9B57",
},

categoryChipText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#2E9B57",
},
});