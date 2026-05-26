import { ShoppingTheme } from '@/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const { colors, radius } = ShoppingTheme;

type ShoppingTab = 'lista' | 'sklep';

type ShoppingTabsProps = {
  activeTab: ShoppingTab;
  onChangeTab: (tab: ShoppingTab) => void;
};

export function ShoppingTabs({ activeTab, onChangeTab }: ShoppingTabsProps) {
  return (
    <View style={styles.tabs}>
      <Pressable
        onPress={() => onChangeTab('lista')}
        style={[
          styles.tabButton,
          activeTab === 'lista' && styles.tabButtonActive,
        ]}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'lista' && styles.tabTextActive,
          ]}
        >
          Wszystkie
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChangeTab('sklep')}
        style={[
          styles.tabButton,
          activeTab === 'sklep' && styles.tabButtonActive,
        ]}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'sklep' && styles.tabTextActive,
          ]}
        >
          Według sklepu
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.large,
    backgroundColor: colors.tabIdle,
    alignItems: 'center',
  },

  tabButtonActive: {
    backgroundColor: colors.selected,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  tabText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },

  tabTextActive: {
    color: colors.primary,
  },
});
