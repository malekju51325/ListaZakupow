import { ShoppingTheme } from '@/constants/theme';
import { useShopping } from '@/context/ShoppingContext';
import { Produkt } from '@/types/shopping';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { colors, radius } = ShoppingTheme;

function readParam(value: string | string[] | undefined, fallback = '') {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function formatQuantity(ilosc: number, jednostka: string) {
  if (jednostka === 'kg') return `${ilosc} g`;
  if (jednostka === 'op.') return `${ilosc} op.`;
  return `${ilosc} szt.`;
}

function getQuantityStep(jednostka: string) {
  return jednostka === 'kg' ? 50 : 1;
}

function getQuantityMinimum(jednostka: string) {
  return jednostka === 'kg' ? 50 : 1;
}

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const { dane, sklepy, kategorie, edytujProdukt, toggleKupione } =
    useShopping();
  const [showShops, setShowShops] = React.useState(false);
  const [showCategories, setShowCategories] = React.useState(false);

  const productId = Number(readParam(params.id, '0'));
  const fallbackShop = readParam(params.sklep, 'Brak sklepu');
  const fallbackProduct: Produkt = {
    id: productId,
    nazwa: readParam(params.nazwa, 'Produkt'),
    ilosc: Number(readParam(params.ilosc, '1')),
    jednostka: readParam(params.jednostka, 'szt'),
    kategoria: readParam(params.kategoria, ''),
    kupione: readParam(params.kupione, 'nie') === 'tak',
  };

  const znaleziony = React.useMemo(() => {
    for (const sekcja of dane) {
      const produkt = sekcja.data.find((item) => item.id === productId);

      if (produkt) {
        return {
          produkt,
          sklep: sekcja.title,
        };
      }
    }

    return null;
  }, [dane, productId]);

  const produkt = znaleziony?.produkt ?? fallbackProduct;
  const sklep = znaleziony?.sklep ?? fallbackShop;
  const kategoria = produkt.kategoria || 'Inne';

  function handleChangeQuantity(direction: 'minus' | 'plus') {
    const krok = getQuantityStep(produkt.jednostka);
    const minimum = getQuantityMinimum(produkt.jednostka);
    const nextQuantity =
      direction === 'plus'
        ? produkt.ilosc + krok
        : Math.max(minimum, produkt.ilosc - krok);

    edytujProdukt(productId, sklep, { ilosc: nextQuantity });
  }

  function handleChangeShop(nextShop: string) {
    setShowShops(false);
    edytujProdukt(productId, sklep, { sklep: nextShop });
  }

  function handleChangeCategory(nextCategory: string) {
    setShowCategories(false);
    edytujProdukt(productId, sklep, {
      kategoria: nextCategory === 'Inne' ? '' : nextCategory,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{produkt.nazwa}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Ilość</Text>
          <View style={styles.stepper}>
            <Pressable onPress={() => handleChangeQuantity('minus')}>
              <Text style={styles.stepButton}>−</Text>
            </Pressable>

            <Text style={styles.stepValue}>
              {formatQuantity(produkt.ilosc, produkt.jednostka)}
            </Text>

            <Pressable onPress={() => handleChangeQuantity('plus')}>
              <Text style={styles.stepButton}>+</Text>
            </Pressable>
          </View>

          <DropdownSection
            label="Sklep"
            value={sklep}
            isOpen={showShops}
            onToggle={() => {
              setShowShops((prev) => !prev);
              setShowCategories(false);
            }}
            options={sklepy.map((item) => item.name)}
            onSelect={handleChangeShop}
          />

          <DropdownSection
            label="Kategoria"
            value={kategoria}
            isOpen={showCategories}
            onToggle={() => {
              setShowCategories((prev) => !prev);
              setShowShops(false);
            }}
            options={[...kategorie, 'Inne']}
            onSelect={handleChangeCategory}
          />

          <Text style={styles.label}>Kupione</Text>
          <Pressable
            style={[
              styles.statusButton,
              produkt.kupione && styles.statusButtonActive,
            ]}
            onPress={() => toggleKupione(produkt, sklep)}
          >
            <Text
              style={[
                styles.statusButtonText,
                produkt.kupione && styles.statusButtonTextActive,
              ]}
            >
              {produkt.kupione ? 'Tak' : 'Nie'}
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Zamknij</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DropdownSection({
  label,
  value,
  isOpen,
  options,
  onToggle,
  onSelect,
}: {
  label: string;
  value: string;
  isOpen: boolean;
  options: string[];
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const uniqueOptions = [...new Set(options)];

  return (
    <View style={styles.dropdownSection}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.dropdownButton} onPress={onToggle}>
        <Text style={styles.dropdownText}>{value}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>

      {isOpen && (
        <View style={styles.dropdownList}>
          {uniqueOptions.map((option) => (
            <Pressable
              key={option}
              style={[
                styles.dropdownItem,
                option === value && styles.dropdownItemActive,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  option === value && styles.dropdownItemTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
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
    paddingBottom: 40,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    elevation: 3,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: radius.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  stepButton: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: 14,
  },
  stepValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownSection: {
    position: 'relative',
  },
  dropdownButton: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: radius.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  dropdownText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownList: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: colors.selected,
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownItemTextActive: {
    color: colors.primary,
  },
  statusButton: {
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    padding: 14,
  },
  statusButtonActive: {
    backgroundColor: colors.selected,
    borderColor: colors.primary,
  },
  statusButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  statusButtonTextActive: {
    color: colors.primary,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.large,
    marginTop: 20,
    padding: 16,
  },
  buttonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
});
