import { ShoppingTheme } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { colors, radius } = ShoppingTheme;

function readParam(value: string | string[] | undefined, fallback = '') {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const nazwa = readParam(params.nazwa, 'Produkt');
  const sklep = readParam(params.sklep, 'Brak sklepu');
  const ilosc = readParam(params.ilosc, '0');
  const jednostka = readParam(params.jednostka);
  const kategoria = readParam(params.kategoria, 'Inne');
  const kupione = readParam(params.kupione, 'nie');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{nazwa}</Text>

        <View style={styles.card}>
          <InfoRow label="Sklep" value={sklep} />
          <InfoRow label="Ilość" value={`${ilosc} ${jednostka}`} />
          <InfoRow label="Kategoria" value={kategoria} />
          <InfoRow label="Kupione" value={kupione === 'tak' ? 'Tak' : 'Nie'} />
        </View>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Zamknij</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
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
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
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
