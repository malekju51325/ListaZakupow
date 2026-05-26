import { ShoppingTheme } from '@/constants/theme';
import { useShopping } from '@/context/ShoppingContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

const { colors, radius } = ShoppingTheme;

export default function AddScreen() {
  const { width, height } = useWindowDimensions();
  const isNarrow = width < 380;
  const isLandscape = width > height;
  const [nazwa, setNazwa] = React.useState('');
  const [sklep, setSklep] = React.useState('');
  const { dodajProdukt, sklepy, kategorie } = useShopping();
  const [ilosc, setIlosc] = React.useState(1);
  const [jednostka, setJednostka] = React.useState('szt');
  const [showUnits, setShowUnits] = React.useState(false);
  const [kategoria, setKategoria] = React.useState('');

  function dodajProduktHandler() {
    if (!sklep) {
      alert('Wybierz sklep');
      return;
    }

    if (!nazwa.trim() || !sklep.trim()) {
      alert('Uzupełnij wszystkie pola');
      return;
    }

    dodajProdukt(nazwa.trim(), sklep.trim(), ilosc, jednostka, kategoria);

    setNazwa('');
    setSklep('');
    setIlosc(1);
    setJednostka('szt');
    setKategoria('');
    setShowUnits(false);

    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid={true}
        extraScrollHeight={20}
        extraHeight={0}
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={0}
      >
        <View
          style={[
            styles.content,
            {
              // Formularz jest centrowany w poziomie, żeby na tabletach pola nie były nienaturalnie szerokie.
              maxWidth: isLandscape ? 680 : undefined,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Dodaj produkt</Text>
            <Text style={styles.subtitle}>Szybko uzupełnij listę zakupów</Text>
          </View>

          <View style={styles.card}>
            {/* NAZWA */}
            <Text style={styles.label}>Nazwa produktu</Text>
            <TextInput
              value={nazwa}
              onChangeText={setNazwa}
              style={styles.input}
            />

            {/* ILOŚĆ + JEDNOSTKA */}
            <View style={[styles.row, isNarrow && styles.rowNarrow]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Ilość</Text>
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => {
                      if (jednostka === 'kg') {
                        setIlosc((prev) => Math.max(50, prev - 50));
                      } else {
                        setIlosc((prev) => Math.max(1, prev - 1));
                      }
                    }}
                  >
                    <Text style={styles.stepBtn}>−</Text>
                  </Pressable>

                  <Text style={styles.stepValue}>
                    {jednostka === 'kg' ? `${ilosc} g` : ilosc}
                  </Text>

                  <Pressable
                    onPress={() => {
                      if (jednostka === 'kg') {
                        setIlosc((prev) => prev + 50);
                      } else {
                        setIlosc((prev) => prev + 1);
                      }
                    }}
                  >
                    <Text style={styles.stepBtn}>+</Text>
                  </Pressable>
                </View>
              </View>

              {!isNarrow && <View style={{ width: 12 }} />}

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Jednostka</Text>

                <Pressable
                  style={styles.dropdown}
                  onPress={() => setShowUnits(!showUnits)}
                >
                  <Text style={styles.dropdownText}>{jednostka}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>

                {showUnits && (
                  <View style={styles.dropdownList}>
                    {['szt', 'kg', 'op.'].map((j) => (
                      <Pressable
                        key={j}
                        onPress={() => {
                          setJednostka(j);
                          setShowUnits(false);

                          if (j === 'kg') {
                            setIlosc(50);
                          } else {
                            setIlosc(1);
                          }
                        }}
                        style={styles.dropdownItem}
                      >
                        <Text>{j}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* SKLEPY*/}
            <Text style={styles.label}>Sklep</Text>

            <View style={styles.chipsContainer}>
              {sklepy.map((s) => {
                const isActive = sklep === s.name;

                return (
                  <Pressable
                    key={s.name}
                    onPress={() => setSklep(s.name)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive
                          ? `${s.color}20`
                          : colors.muted,
                        borderColor: isActive ? s.color : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isActive ? s.color : colors.text },
                      ]}
                    >
                      {s.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {/* KATEGORIE */}
            <Text style={styles.label}>Kategoria</Text>

            <View style={styles.chipsContainer}>
              {kategorie.map((k) => {
                const isActive = kategoria === k;

                return (
                  <Pressable
                    key={k}
                    onPress={() => setKategoria(k)}
                    style={[
                      styles.categoryChip,
                      isActive && styles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isActive && styles.categoryChipTextActive,
                      ]}
                    >
                      {k}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable style={styles.button} onPress={dodajProduktHandler}>
            <Text style={styles.buttonText}>Dodaj do listy</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },

  input: {
    backgroundColor: colors.input,
    fontWeight: '600',
    borderRadius: radius.medium,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },

  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: radius.large,
    alignItems: 'center',
  },

  buttonText: {
    color: colors.card,
    fontWeight: '600',
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  rowNarrow: {
    flexDirection: 'column',
    gap: 12,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input,
    borderRadius: radius.medium,
    padding: 10,
  },

  stepBtn: {
    fontSize: 20,
    color: colors.primary,
    paddingHorizontal: 10,
  },

  stepValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 6,
    elevation: 3,
  },

  dropdownItem: {
    padding: 10,
  },
  dropdown: {
    backgroundColor: colors.input,
    borderRadius: radius.medium,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },

  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },

  categoryChipActive: {
    backgroundColor: colors.selected,
    borderColor: colors.primary,
  },

  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  categoryChipTextActive: {
    color: colors.primary,
  },
  header: {
    backgroundColor: colors.header,
    marginHorizontal: -20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    marginBottom: 16,
  },
});
