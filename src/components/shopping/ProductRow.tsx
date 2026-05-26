import { ShoppingTheme } from '@/constants/theme';
import { Produkt } from '@/types/shopping';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

const { colors, radius } = ShoppingTheme;

type ProductRowProps = {
  item: Produkt;
  sklep: string;
  shopColor?: string;
  showCategory?: boolean;
  showShopBadge?: boolean;
  showQuantity?: boolean;
  onToggle: (produkt: Produkt, sklep: string) => void;
  onDelete?: (produkt: Produkt, sklep: string) => void;
  onIncrease?: (produkt: Produkt, sklep: string) => void;
  onDecrease?: (produkt: Produkt, sklep: string) => void;
  onOpen?: (produkt: Produkt, sklep: string) => void;
};

// Format zostaje w UI, bo model przechowuje jednostkę użytkownika, a ekran pokazuje kg jako gramy.
function formatQuantityUnit(jednostka: string) {
  if (jednostka === 'kg') return 'g';
  if (jednostka === 'op.') return 'op.';
  return 'szt.';
}

function ProductRowComponent({
  item,
  sklep,
  shopColor = colors.primary,
  showCategory = false,
  showShopBadge = false,
  showQuantity = true,
  onToggle,
  onDelete,
  onIncrease,
  onDecrease,
  onOpen,
}: ProductRowProps) {
  const handleToggle = React.useCallback(() => {
    onToggle(item, sklep);
  }, [item, onToggle, sklep]);

  const handleDelete = React.useCallback(() => {
    onDelete?.(item, sklep);
  }, [item, onDelete, sklep]);

  const handleIncrease = React.useCallback(() => {
    onIncrease?.(item, sklep);
  }, [item, onIncrease, sklep]);

  const handleDecrease = React.useCallback(() => {
    onDecrease?.(item, sklep);
  }, [item, onDecrease, sklep]);

  const handleOpen = React.useCallback(() => {
    onOpen?.(item, sklep);
  }, [item, onOpen, sklep]);

  const content = (
    <View style={[styles.itemBox, item.kupione && styles.itemBoxBought]}>
      <View style={styles.leftSection}>
        <Pressable onPress={handleToggle}>
          <View
            style={[styles.checkbox, item.kupione && styles.checkboxActive]}
          />
        </Pressable>

        <Pressable
          style={styles.itemDetails}
          onPress={handleOpen}
          disabled={!onOpen}
        >
          <Text
            style={[styles.itemText, item.kupione && styles.boughtText]}
            numberOfLines={2}
          >
            {item.nazwa}
          </Text>

          {showCategory && !!item.kategoria && (
            <Text style={styles.meta}>
              <Text style={styles.metaDot}>• </Text>
              {item.kategoria.toLowerCase()}
            </Text>
          )}
        </Pressable>
      </View>

      {(showQuantity || showShopBadge) && (
        <View style={styles.rightSectionRow}>
          {showQuantity && (
            <Pressable onPress={handleIncrease} onLongPress={handleDecrease}>
              <Text style={styles.quantitySmall}>
                {item.ilosc} {formatQuantityUnit(item.jednostka)}
              </Text>
            </Pressable>
          )}

          {showShopBadge && (
            <View
              style={[
                styles.shopBadge,
                {
                  borderColor: shopColor,
                  backgroundColor: `${shopColor}20`,
                },
              ]}
            >
              <Text style={[styles.shopBadgeText, { color: shopColor }]}>
                {sklep[0]}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (!onDelete) {
    return content;
  }

  return (
    <Swipeable
      renderRightActions={() => (
        <Pressable onPress={handleDelete} style={styles.deleteSwipe}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </Pressable>
      )}
    >
      {content}
    </Swipeable>
  );
}

// Wiersz jest memoizowany, bo lista może mieć dużo produktów i zmiana jednego elementu nie powinna odświeżać wszystkich.
export const ProductRow = React.memo(ProductRowComponent);

const styles = StyleSheet.create({
  itemBox: {
    backgroundColor: colors.card,
    borderRadius: radius.large,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },

  itemBoxBought: {
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
  },

  checkboxActive: {
    backgroundColor: colors.primary,
  },

  itemDetails: {
    marginLeft: 10,
    flex: 1,
    minWidth: 0,
  },

  itemText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },

  boughtText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    flexShrink: 1,
  },

  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  metaDot: {
    color: colors.primary,
  },

  rightSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
    marginLeft: 8,
  },

  quantitySmall: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },

  shopBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.large,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.selected,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shopBadgeText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },

  deleteSwipe: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1.5,
    borderColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: radius.large,
    marginBottom: 12,
  },
});
