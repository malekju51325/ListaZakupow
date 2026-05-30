import { ShoppingTheme } from '@/constants/theme';
import { useShopping } from '@/context/ShoppingContext';
import { groupProductsByCategory } from '@/utils/shoppingSelectors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

const { colors, radius } = ShoppingTheme;
const SHOP_COLORS = [
  colors.primary,
  colors.info,
  colors.warning,
  colors.danger,
  colors.textMuted,
];

export default function SettingsScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const {
    dane,
    wyczyscListe,
    usunKupione,
    sklepy,
    dodajSklep,
    usunSklep,
    kategorie,
    dodajKategorie,
    usunKategorie,
  } = useShopping();
  const [nowySklep, setNowySklep] = React.useState('');
  const [showAddShop, setShowAddShop] = React.useState(false);
  const [wybranyKolor, setWybranyKolor] = React.useState<string>(
    colors.primary,
  );
  const [nowaKategoria, setNowaKategoria] = React.useState('');
  const [showAddCategory, setShowAddCategory] = React.useState(false);

  const wszystkieProdukty = dane.flatMap((sekcja) =>
    sekcja.data.map((produkt) => ({
      ...produkt,
      sklep: sekcja.title,
    })),
  );
  const kupione = wszystkieProdukty.filter((produkt) => produkt.kupione);

  function handleWyczyscListe() {
    if (wszystkieProdukty.length === 0) {
      Alert.alert('Pusta lista', 'Nie ma produktów do usunięcia.');
      return;
    }

    Alert.alert(
      'Wyczyść listę',
      'Czy na pewno chcesz usunąć wszystkie produkty?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usuń', style: 'destructive', onPress: wyczyscListe },
      ],
    );
  }

  function handleUsunKupione() {
    if (kupione.length === 0) {
      Alert.alert('Brak produktów', 'Nie ma produktów w sekcji "Kupione".');
      return;
    }

    Alert.alert(
      'Usuń kupione',
      'Czy chcesz usunąć wszystkie produkty z sekcji "Kupione"?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usuń', style: 'destructive', onPress: usunKupione },
      ],
    );
  }

  async function handleDodajSklep() {
    if (!nowySklep.trim()) {
      alert('Podaj nazwę sklepu');
      return;
    }

    const istnieje = sklepy.find(
      (s) => s.name.toLowerCase() === nowySklep.toLowerCase(),
    );

    if (istnieje) {
      alert('Taki sklep już istnieje');
      return;
    }

    await dodajSklep(nowySklep.trim(), wybranyKolor);

    setNowySklep('');
  }

  async function handleDodajKategorie() {
    if (!nowaKategoria.trim()) {
      alert('Podaj nazwę kategorii');
      return;
    }

    const istnieje = kategorie.find(
      (k) => k.toLowerCase() === nowaKategoria.toLowerCase(),
    );

    if (istnieje) {
      alert('Taka kategoria już istnieje');
      return;
    }

    await dodajKategorie(nowaKategoria.trim());
    setNowaKategoria('');
  }

  function handleUsunKategorie(kategoria: string) {
    const produktyWKategorii = wszystkieProdukty.filter(
      (produkt) => produkt.kategoria === kategoria,
    ).length;

    const message =
      produktyWKategorii > 0
        ? `Ta kategoria jest używana przez ${produktyWKategorii} produktów. Po usunięciu trafią do "Inne".`
        : 'Czy na pewno chcesz usunąć tę kategorię?';

    Alert.alert('Usuń kategorię', message, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => usunKategorie(kategoria),
      },
    ]);
  }

  function handleUsunSklep(sklep: string) {
    const sekcjaSklepu = dane.find((sekcja) => sekcja.title === sklep);
    const liczbaProduktow = sekcjaSklepu?.data.length ?? 0;

    if (liczbaProduktow > 0) {
      Alert.alert(
        'Nie można usunąć sklepu',
        `Sklep "${sklep}" ma ${liczbaProduktow} produktów. Usuń je z listy przed usunięciem sklepu.`,
      );
      return;
    }

    Alert.alert('Usuń sklep', `Czy na pewno chcesz usunąć sklep "${sklep}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => usunSklep(sklep),
      },
    ]);
  }

  async function handleUdostepnij() {
    if (wszystkieProdukty.length === 0) {
      Alert.alert('Pusta lista', 'Nie ma produktów do udostępnienia.');
      return;
    }

    let tekst = 'LISTA ZAKUPÓW\n\n';

    dane.forEach((sekcja) => {
      if (sekcja.data.length === 0) return;

      tekst += `${sekcja.title.toUpperCase()}\n\n`;

      const produktyByCategory = groupProductsByCategory(sekcja.data);

      Object.entries(produktyByCategory).forEach(([kategoria, produkty]) => {
        tekst += `• ${kategoria}\n`;

        produkty.forEach((produkt) => {
          const jednostka =
            produkt.jednostka === 'kg'
              ? `${produkt.ilosc} g`
              : produkt.jednostka === 'op.'
                ? `${produkt.ilosc} op.`
                : `${produkt.ilosc} szt.`;

          tekst += `   - ${produkt.nazwa} (${jednostka})\n`;
        });

        tekst += '\n';
      });
    });

    try {
      // Systemowe udostępnianie nie wymaga osobnej integracji z komunikatorami ani uprawnień.
      await Share.share({
        message: tekst,
      });
    } catch {
      Alert.alert('Błąd', 'Nie udało się udostępnić listy.');
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
        <View
          style={[
            styles.content,
            {
              maxWidth: isLandscape ? 680 : undefined,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
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
              <Text style={styles.plus}>{showAddShop ? '−' : '+'}</Text>
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

                <Pressable
                  onPress={() => handleUsunSklep(s.name)}
                  style={styles.shopDeleteButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colors.danger}
                  />
                </Pressable>
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
                {SHOP_COLORS.map((c) => (
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
              <Text style={styles.plus}>{showAddCategory ? '−' : '+'}</Text>
            </Pressable>
          </View>

          {/* LISTA KATEGORII */}
          <View style={styles.card}>
            <View style={styles.chipsContainer}>
              {kategorie.map((k) => (
                <View key={k} style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{k}</Text>
                  <Pressable
                    onPress={() => handleUsunKategorie(k)}
                    style={styles.categoryDeleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={14}
                      color={colors.danger}
                    />
                  </Pressable>
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

              <Pressable
                style={styles.addButton}
                onPress={handleDodajKategorie}
              >
                <Text style={styles.addButtonText}>Dodaj kategorię</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 10,
    marginTop: 10,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  button: {
    backgroundColor: colors.selected,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    alignItems: 'center',
  },

  deleteButton: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },

  buttonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },

  deleteButtonText: {
    color: colors.danger,
  },

  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  shopCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  shopLetter: {
    fontWeight: '600',
    color: colors.text,
  },

  shopName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },

  shopDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  addButtonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: radius.medium,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },

  label: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },

  colorsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },

  plus: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
    paddingHorizontal: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.selected,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  categoryDeleteButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
