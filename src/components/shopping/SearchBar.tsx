import { ShoppingTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

const { colors, radius } = ShoppingTheme;

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  const isSearching = value.trim().length > 0;

  return (
    <View style={styles.searchBox}>
      <Ionicons name="search-outline" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Szukaj produktu"
        placeholderTextColor={colors.placeholder}
        style={styles.searchInput}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {isSearching && (
        <Pressable
          onPress={() => onChangeText('')}
          style={styles.searchClear}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: colors.card,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 10,
  },

  searchClear: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
