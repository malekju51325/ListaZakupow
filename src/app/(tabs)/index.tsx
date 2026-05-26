import { ShoppingTheme } from '@/constants/theme';
import { ProductRow } from '@/components/shopping/ProductRow';
import { SearchBar } from '@/components/shopping/SearchBar';
import { ShoppingTabs } from '@/components/shopping/ShoppingTabs';
import { useShopping } from '@/context/ShoppingContext';
import {
  buildShoppingSections,
  filterShoppingData,
  groupProductsByCategory,
  isShoppingSearchActive,
} from '@/utils/shoppingSelectors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Apple,
  Beef,
  Carrot,
  Croissant,
  Fish,
  FlaskConical,
  Milk,
  Tag,
} from 'lucide-react-native';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Produkt } from '@/types/shopping';

const { colors, radius } = ShoppingTheme;

type CategoryIcon = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  Nabiał: Milk,
  Pieczywo: Croissant,
  Warzywa: Carrot,
  Owoce: Apple,
  Mięso: Beef,
  Ryby: Fish,
  Chemia: FlaskConical,
};

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const contentPadding = width < 400 ? 10 : 20;
  const [tab, setTab] = React.useState<'lista' | 'sklep'>('lista');
  const [searchText, setSearchText] = React.useState('');
  const {
    dane,
    sklepy,
    isLoading,
    isSaving,
    storageError,
    lastSavedAt,
    clearStorageError,
    reloadShoppingData,
    usunProdukt,
    toggleKupione,
    zwiekszIlosc,
    zmniejszIlosc,
  } = useShopping();
  const [expandedShop, setExpandedShop] = React.useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(
    null,
  );
  const [expandedSections, setExpandedSections] = React.useState<
    Record<string, boolean>
  >({
    'Do kupienia': true,
    Kupione: true,
  });
  const isSearching = isShoppingSearchActive(searchText);

  const shopColorByName = React.useMemo(() => {
    return new Map(sklepy.map((sklep) => [sklep.name, sklep.color]));
  }, [sklepy]);

  const filteredDane = React.useMemo(() => {
    return filterShoppingData(dane, searchText);
  }, [dane, searchText]);

  const sections = React.useMemo(() => {
    return buildShoppingSections(filteredDane, expandedSections, isSearching);
  }, [filteredDane, expandedSections, isSearching]);

  const shopSections = React.useMemo(() => {
    return filteredDane.map((sekcja) => ({
      ...sekcja,
      color: shopColorByName.get(sekcja.title) ?? colors.primary,
      boughtProducts: sekcja.data.filter((produkt) => produkt.kupione),
      productsByCategory: groupProductsByCategory(sekcja.data),
    }));
  }, [filteredDane, shopColorByName]);

  const handleToggleProduct = React.useCallback(
    (item: Produkt, sklep: string) => {
      toggleKupione(item, sklep);
    },
    [toggleKupione],
  );

  const handleDeleteProduct = React.useCallback(
    (item: Produkt, sklep: string) => {
      usunProdukt(item, sklep);
    },
    [usunProdukt],
  );

  const handleIncreaseProduct = React.useCallback(
    (item: Produkt, sklep: string) => {
      zwiekszIlosc(item, sklep);
    },
    [zwiekszIlosc],
  );

  const handleDecreaseProduct = React.useCallback(
    (item: Produkt, sklep: string) => {
      zmniejszIlosc(item, sklep);
    },
    [zmniejszIlosc],
  );

  const openProductDetails = React.useCallback(
    (item: Produkt, sklep: string) => {
      router.push({
        pathname: '../product-details',
        // Parametry są proste tekstowo, żeby ekran szczegółów nie musiał znać struktury całej listy.
        params: {
          nazwa: item.nazwa,
          sklep,
          ilosc: String(item.ilosc),
          jednostka: item.jednostka,
          kategoria: item.kategoria || 'Inne',
          kupione: item.kupione ? 'tak' : 'nie',
        },
      });
    },
    [],
  );

  const renderProductItem = React.useCallback(
    ({ item }: { item: Produkt & { sklep: string } }) => {
      const kolor = shopColorByName.get(item.sklep) ?? colors.primary;

      return (
        <ProductRow
          item={item}
          sklep={item.sklep}
          shopColor={kolor}
          showCategory
          showShopBadge
          onToggle={handleToggleProduct}
          onDelete={handleDeleteProduct}
          onIncrease={handleIncreaseProduct}
          onDecrease={handleDecreaseProduct}
          onOpen={openProductDetails}
        />
      );
    },
    [
      handleDecreaseProduct,
      handleDeleteProduct,
      handleIncreaseProduct,
      handleToggleProduct,
      openProductDetails,
      shopColorByName,
    ],
  );

  const renderSectionHeader = React.useCallback(
    ({ section }: { section: { title: string } }) => {
      const expanded = expandedSections[section.title];

      return (
        <Pressable
          onPress={() =>
            setExpandedSections((prev) => ({
              ...prev,
              [section.title]: !prev[section.title],
            }))
          }
          style={styles.sectionHeader}
        >
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.section,
                section.title === 'Kupione' && styles.sectionBought,
              ]}
            >
              {section.title.toUpperCase()}
            </Text>

            <Ionicons
              name={expanded ? 'chevron-down' : 'chevron-forward'}
              size={18}
              color={
                section.title === 'Kupione' ? colors.textMuted : colors.primary
              }
            />
          </View>
        </Pressable>
      );
    },
    [expandedSections],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Ładowanie...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View
        style={[
          styles.container,
          {
            padding: contentPadding,
            // W poziomie nie rozciągamy listy na całą szerokość, bo długie wiersze są wtedy trudniejsze do skanowania.
            maxWidth: isLandscape ? 760 : undefined,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Image
              source={require('../../../assets/images/app-icon.png')}
              style={styles.headerIcon}
            />

            <Text style={styles.title}>Lista zakupów</Text>
          </View>
        </View>
        <ShoppingTabs activeTab={tab} onChangeTab={setTab} />

        <SearchBar value={searchText} onChangeText={setSearchText} />

        {storageError && (
          <View style={styles.statusError}>
            <Text style={styles.statusErrorText}>{storageError}</Text>
            <View style={styles.statusActions}>
              <Pressable
                style={styles.retryButton}
                onPress={reloadShoppingData}
              >
                <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
              </Pressable>

              <Pressable onPress={clearStorageError}>
                <Text style={styles.dismissErrorText}>Ukryj</Text>
              </Pressable>
            </View>
          </View>
        )}

        {isSaving && <Text style={styles.statusText}>Zapisywanie...</Text>}

        {!isSaving && !!lastSavedAt && (
          <Text style={styles.statusText}>Zapisano</Text>
        )}

        {tab === 'lista' ? (
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderProductItem}
            renderSectionHeader={renderSectionHeader}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            removeClippedSubviews
            updateCellsBatchingPeriod={50}
            windowSize={7}
            ListEmptyComponent={
              <Text style={styles.empty}>Brak produktów</Text>
            }
          />
        ) : (
          // Ten widok ma własne przewijanie, żeby wyszukiwarka i przełącznik zakładek zostały zawsze pod ręką.
          <ScrollView
            contentContainerStyle={styles.shopListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredDane.length === 0 ? (
              <Text style={styles.empty}>
                {isSearching ? 'Brak wyników' : 'Brak produktów'}
              </Text>
            ) : (
              shopSections.map((sekcja) => {
                const isExpanded = expandedShop === sekcja.title;
                const showShopContent = isSearching || isExpanded;

                return (
                  <View key={sekcja.title}>
                    {/* SHOP HEADER */}
                    <Pressable
                      style={styles.shopHeader}
                      onPress={() =>
                        setExpandedShop(isExpanded ? null : sekcja.title)
                      }
                    >
                      <View
                        style={[
                          styles.shopCircleBig,
                          {
                            borderColor: sekcja.color,
                            backgroundColor: `${sekcja.color}20`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.shopCircleText,
                            { color: sekcja.color },
                          ]}
                        >
                          {sekcja.title[0]}
                        </Text>
                      </View>

                      <Text style={styles.shopTitle}>{sekcja.title}</Text>
                    </Pressable>

                    {/* CONTENT */}
                    {showShopContent && (
                      <View>
                        {Object.entries(sekcja.productsByCategory).map(
                          ([kategoria, produkty]) => {
                            const categoryKey = `${sekcja.title}-${kategoria}`;

                            const expanded =
                              isSearching || expandedCategory === categoryKey;

                            const CategoryIcon =
                              CATEGORY_ICONS[kategoria] || Tag;

                            return (
                              <View key={categoryKey}>
                                {/* CATEGORY HEADER */}
                                <Pressable
                                  style={[
                                    styles.categoryHeader,
                                    expanded && styles.categoryHeaderActive,
                                  ]}
                                  onPress={() =>
                                    setExpandedCategory(
                                      expanded ? null : categoryKey,
                                    )
                                  }
                                >
                                  <>
                                    <View style={styles.categoryLeft}>
                                      <CategoryIcon
                                        size={18}
                                        color={colors.primary}
                                        strokeWidth={2}
                                      />

                                      <Text style={styles.categoryTitle}>
                                        {kategoria}
                                      </Text>
                                    </View>

                                    <Ionicons
                                      name={
                                        expanded
                                          ? 'chevron-down'
                                          : 'chevron-forward'
                                      }
                                      size={18}
                                      color={colors.primary}
                                    />
                                  </>
                                </Pressable>

                                {/* PRODUCTS */}
                                {expanded &&
                                  produkty.map((item: Produkt) => (
                                    <ProductRow
                                      key={item.id}
                                      item={item}
                                      sklep={sekcja.title}
                                      onToggle={handleToggleProduct}
                                      onDelete={handleDeleteProduct}
                                      onIncrease={handleIncreaseProduct}
                                      onDecrease={handleDecreaseProduct}
                                      onOpen={openProductDetails}
                                    />
                                  ))}
                              </View>
                            );
                          },
                        )}

                        {/* KUPIONE */}
                        {sekcja.boughtProducts.length > 0 && (
                          <View>
                            <Text style={styles.kupioneHeader}>✓ Kupione</Text>

                            {sekcja.boughtProducts.map((item) => (
                              <ProductRow
                                key={item.id}
                                item={item}
                                sklep={sekcja.title}
                                showQuantity={false}
                                onToggle={handleToggleProduct}
                                onOpen={openProductDetails}
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignSelf: 'center',
    backgroundColor: colors.success,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  section: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 20,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  item: {
    fontSize: 16,
    padding: 12,

    marginTop: 6,
    borderRadius: 8,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  kupione: {
    textDecorationLine: 'line-through',
    color: colors.success,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    marginLeft: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: colors.textMuted,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusError: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: radius.medium,
    borderWidth: 1,
    marginBottom: 8,
    padding: 10,
  },
  statusErrorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: colors.danger,
    borderRadius: radius.medium,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  dismissErrorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
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

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  rightSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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

  itemText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
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

  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 145,
    gap: 12,
  },
  sectionBought: {
    color: colors.textMuted,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },

  boughtText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  smallButton: {
    backgroundColor: colors.success,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginRight: 8,
  },

  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 16,
    textAlign: 'center',
  },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 6,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sectionSum: {
    fontSize: 13,
    color: colors.textMuted,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

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
  itemBoxBought: {
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
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
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 10,
  },

  shopListContent: {
    paddingBottom: 32,
  },

  shopCircleBig: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shopCircleText: {
    fontWeight: '700',
  },

  shopTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  categoryHeader: {
    backgroundColor: colors.background,
    borderRadius: radius.large,
    borderWidth: 1.5,
    borderColor: colors.borderMuted,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },

  kupioneHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: 18,
    marginBottom: 12,
  },
  categoryHeaderActive: {
    backgroundColor: colors.selected,
    borderColor: colors.primary,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
