import { Colors } from "@/constants/theme";
import { useShopping } from "@/context/ShoppingContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Apple,
  Beef,
  Carrot,
  Croissant,
  Fish,
  FlaskConical,
  Milk,
  Tag
} from "lucide-react-native";
import React from "react";
import {
  Button,
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const [tab, setTab] = React.useState("lista");
  const { dane, sklepy,usunProdukt, toggleKupione,zwiekszIlosc,
  zmniejszIlosc } = useShopping();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedShop, setExpandedShop] = React.useState<string | null>(null);
const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
const [expandedSections, setExpandedSections] = React.useState({
  "Do kupienia": true,
  "Kupione": true,
});
const categoryIcons: Record<string, any> = {
  Nabiał: Milk,
  Pieczywo: Croissant,
  Warzywa: Carrot,
  Owoce: Apple,
  Mięso: Beef,
  Ryby: Fish,
  Chemia: FlaskConical,
};


  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 1000));

      } catch (e) {
        setError("Błąd ładowania danych");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (value: number) =>
    Number(value.toFixed(2)).toString();

 const sections = React.useMemo(() => {
  const wszystkieProdukty = dane.flatMap((sekcja) =>
    sekcja.data.map((item) => ({
      ...item,
      sklep: sekcja.title,
    })),
  );

  const doKupienia = wszystkieProdukty.filter((p) => !p.kupione);
  const kupione = wszystkieProdukty.filter((p) => p.kupione);

  return [
    {
      title: "Do kupienia",
      data: expandedSections["Do kupienia"] ? doKupienia : [],
    },
    {
      title: "Kupione",
      data: expandedSections["Kupione"] ? kupione : [],
    },
  ];
}, [dane, expandedSections]);


  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Ładowanie...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{error}</Text>
          <Button title="Spróbuj ponownie" onPress={() => router.replace("/")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }} edges={["top"]}>
      <View style={[styles.container, { padding: width < 400 ? 10 : 20 }]}>
        <View style={styles.header}>
        <View style={styles.headerRow}>
    <Image
      source={require("../../../assets/images/app-icon.png")}
      style={styles.headerIcon}
    />

    <Text style={styles.title}>Lista zakupów</Text>
  </View>
        </View>
       <View style={styles.tabs}>
  <Pressable
    onPress={() => setTab("lista")}
    style={[
      styles.tabButton,
      tab === "lista" && styles.tabButtonActive,
    ]}
  >
    <Text
      style={[
        styles.tabText,
        tab === "lista" && styles.tabTextActive,
      ]}
    >
      Wszystkie
    </Text>
  </Pressable>

  <Pressable
    onPress={() => setTab("sklep")}
    style={[
      styles.tabButton,
      tab === "sklep" && styles.tabButtonActive,
    ]}
  >
    <Text
      style={[
        styles.tabText,
        tab === "sklep" && styles.tabTextActive,
      ]}
    >
      Według sklepu
    </Text>
  </Pressable>
</View>
  


        {tab === "lista" ? (
          <SectionList
            sections={sections}
            keyExtractor={(_, index) => index.toString()}
           renderItem={({ item }) => {
  const sklepObj = sklepy.find((s) => s.name === item.sklep);
  const kolor = sklepObj?.color || "#2E9B57";

  return  (
    <Swipeable
  renderRightActions={() => (
    <Pressable
      onPress={() => usunProdukt(item, item.sklep)}
      style={styles.deleteSwipe}
    >
     <Ionicons name="trash-outline" size={22} color="#C54B3D" />
    </Pressable>
  )}
>
  <View style={[styles.itemBox, item.kupione && styles.itemBoxBought]}>
<View style={styles.leftSection}>
  <Pressable onPress={() => toggleKupione(item, item.sklep)}>
    <View
      style={[
        styles.checkbox,
        item.kupione && styles.checkboxActive,
      ]}
    />
  </Pressable>

  <View style={{ marginLeft: 10 }}>
    <Text
      style={[
        styles.itemText,
        item.kupione && styles.boughtText,
      ]}
    >
      {item.nazwa}
    </Text>

 {!!item.kategoria && (
  <Text style={styles.meta}>
    <Text style={{ color: "#2E9B57" }}>• </Text>
    {item.kategoria.toLowerCase()}
  </Text>
)}
  </View>
</View>

    <View style={styles.rightSectionRow}>
      <Pressable
  onPress={() => zwiekszIlosc(item, item.sklep)}
  onLongPress={() => zmniejszIlosc(item, item.sklep)}
>
  <Text style={styles.quantitySmall}>
    {item.ilosc} {item.jednostka === "kg" ? "g" : "szt."}
  </Text>
</Pressable>

      <View
  style={[
    styles.shopBadge,
    {
      borderColor: kolor,
      backgroundColor: `${kolor}20`,
    },
  ]}
>
        <Text style={[styles.shopBadgeText, { color: kolor }]}>
          {item.sklep[0]}
        </Text>
      </View>
    </View>
  </View>
  </Swipeable>
          );
}}
         renderSectionHeader={({ section }) => {
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={[
            styles.section,
            section.title === "Kupione" &&
              styles.sectionBought,
          ]}
        >
          {section.title.toUpperCase()}
        </Text>

        <Ionicons
          name={
            expanded
              ? "chevron-down"
              : "chevron-forward"
          }
          size={18}
          color={
            section.title === "Kupione"
              ? "#6A746C"
              : "#2E9B57"
          }
        />
      </View>
    </Pressable>
  );
}}
            ListEmptyComponent={<Text style={styles.empty}>Brak produktów</Text>}
          />
        ) : (
  <View>

    {dane.map((sekcja) => {
      const sklepObj = sklepy.find((s) => s.name === sekcja.title);
      const kolor = sklepObj?.color || "#2E9B57";

      const produktyKupione = sekcja.data.filter((p) => p.kupione);

      const produktyByCategory = sekcja.data
        .filter((p) => !p.kupione)
        .reduce((acc: any, produkt) => {
          const key = produkt.kategoria || "Inne";

          if (!acc[key]) {
            acc[key] = [];
          }

          acc[key].push(produkt);

          return acc;
        }, {});

      const isExpanded = expandedShop === sekcja.title;

      return (
        <View key={sekcja.title}>

          {/* SHOP HEADER */}
          <Pressable
            style={styles.shopHeader}
            onPress={() =>
              setExpandedShop(
                isExpanded ? null : sekcja.title
              )
            }
          >
            <View
              style={[
                styles.shopCircleBig,
                {
                  borderColor: kolor,
                  backgroundColor: `${kolor}20`,
                },
              ]}
            >
              <Text style={[styles.shopCircleText, { color: kolor }]}>
                {sekcja.title[0]}
              </Text>
            </View>

            <Text style={styles.shopTitle}>
              {sekcja.title}
            </Text>
          </Pressable>

          {/* CONTENT */}
          {isExpanded && (
            <View>

              {Object.entries(produktyByCategory).map(
  ([kategoria, produkty]: any) => {
    const categoryKey = `${sekcja.title}-${kategoria}`;

    const expanded =
      expandedCategory === categoryKey;

    const CategoryIcon = categoryIcons[kategoria] || Tag;

    return (
                    <View key={categoryKey}>

                      {/* CATEGORY HEADER */}
                    <Pressable
  style={[
    styles.categoryHeader,
    expanded && styles.categoryHeaderActive,
  ]}
  onPress={() =>
    setExpandedCategory(expanded ? null : categoryKey)
  }
>
                       <>
 

<View style={styles.categoryLeft}>
  <CategoryIcon
    size={18}
    color="#2E9B57"
    strokeWidth={2}
  />

  <Text style={styles.categoryTitle}>
    {kategoria}
  </Text>
</View>

  <Ionicons
    name={expanded ? "chevron-down" : "chevron-forward"}
    size={18}
    color="#2E9B57"
  />
</>
                      </Pressable>

                      {/* PRODUCTS */}
                      {expanded &&
                        produkty.map((item: any) => (
                          <Swipeable
                            key={item.id}
                            renderRightActions={() => (
                              <Pressable
                                onPress={() =>
                                  usunProdukt(item, sekcja.title)
                                }
                                style={styles.deleteSwipe}
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={22}
                                  color="#C54B3D"
                                />
                              </Pressable>
                            )}
                          >
                            <View
                              style={[
                                styles.itemBox,
                                item.kupione &&
                                  styles.itemBoxBought,
                              ]}
                            >
                              <View style={styles.leftSection}>
                                <Pressable
                                  onPress={() =>
                                    toggleKupione(
                                      item,
                                      sekcja.title
                                    )
                                  }
                                >
                                  <View
                                    style={[
                                      styles.checkbox,
                                      item.kupione &&
                                        styles.checkboxActive,
                                    ]}
                                  />
                                </Pressable>

                                <View style={{ marginLeft: 10 }}>
                                  <Text
                                    style={[
                                      styles.itemText,
                                      item.kupione &&
                                        styles.boughtText,
                                    ]}
                                  >
                                    {item.nazwa}
                                  </Text>

                                  
                                </View>
                              </View>

                             <Pressable
  onPress={() => zwiekszIlosc(item, item.sklep)}
  onLongPress={() => zmniejszIlosc(item, item.sklep)}
>
  <Text style={styles.quantitySmall}>
    {item.ilosc} {item.jednostka === "kg" ? "g" : "szt."}
  </Text>
</Pressable>
                            </View>
                          </Swipeable>
                        ))}
                    </View>
                  );
                }
              )}

              {/* KUPIONE */}
              {produktyKupione.length > 0 && (
                <View>
                  <Text style={styles.kupioneHeader}>
                    ✓ Kupione
                  </Text>

                  {produktyKupione.map((item) => (
                   <Pressable
  key={item.id}
  onPress={() => toggleKupione(item, sekcja.title)}
>
  <View
    style={[
      styles.itemBox,
      styles.itemBoxBought,
    ]}
  >
                      <View style={styles.leftSection}>
                        <View
                          style={[
                            styles.checkbox,
                            styles.checkboxActive,
                          ]}
                        />

                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.boughtText}>
                            {item.nazwa}
                          </Text>
                        </View>
                      </View>
                    </View>
                    </Pressable>
                  ))}
                </View>
                
              )}

            </View>
          )}

        </View>
      );
    })}

  </View>

  )}    
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignSelf: "center",
    backgroundColor: "#2ecc71",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F8F7"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

section: {
  fontSize: 16,
  fontWeight: "800",
  marginTop: 20,
  color: "#2E9B57",
  letterSpacing: 0.8,
},
meta: {
  fontSize: 12,
  color: "#6A746C",
  marginTop: 2,
},
  item: {
    fontSize: 16,
    padding: 12,

    marginTop: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  kupione: {
    textDecorationLine: "line-through",
    color: "#2ecc71",
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    marginLeft: 8,
  },
  empty: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
itemBox: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 14,
  marginBottom: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  elevation: 2,
  shadowColor: "#000",
  shadowOpacity: 0.04,
  shadowRadius: 8,
},

leftSection: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
},

rightSectionRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

checkbox: {
  width: 22,
  height: 22,
  borderRadius: 6,
  borderWidth: 2,
  borderColor: "#2E9B57",
  marginRight: 12,
},

checkboxActive: {
  backgroundColor: "#2E9B57",
},

itemText: {
  fontSize: 16,
  fontWeight: "700",
  color: "#162018",
},

quantitySmall: {
  fontSize: 13,
  color: "#6A746C",
  fontWeight: "500",
},

shopBadge: {
  width: 32,
  height: 32,
  borderRadius: 16,
  borderWidth: 1.5,
  borderColor: "#2E9B57",
  backgroundColor: "#EAF5EE",
  justifyContent: "center",
  alignItems: "center",
},

shopBadgeText: {
  color: "#2E9B57",
  fontWeight: "700",
  fontSize: 13,
},

  rightControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 145,
    gap: 12,
  },
sectionBought: {
  color: "#6A746C",
},
headerRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

headerIcon: {
  width: 38,
  height: 38,
  borderRadius: 10,
},

title: {
  fontSize: 26,
  fontWeight: "700",
  color: "#162018",
},


  boughtText: {
    fontSize: 16,
   fontWeight: "700",
  color: "#6A746C",
    textDecorationLine: "line-through",
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  smallButton: {
    backgroundColor: "#2ecc71",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginRight: 8,
  },

  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 16,
    textAlign: "center",
  },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 6,
  },

sectionSum: {
  fontSize: 13,
  color: "#6A746C",
},
tabs: {
  flexDirection: "row",
  gap: 10,
  marginBottom: 14,
},

tabButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 16,
  backgroundColor: "#E6E8E7", 
  alignItems: "center",
},

tabButtonActive: {
  backgroundColor: "#EAF5EE", 
  borderWidth: 1.5,
  borderColor: "#2E9B57",
},

tabText: {
  fontSize: 14,
  color: "#6A746C",
  fontWeight: "600",
},

tabTextActive: {
  color: "#2E9B57",
},


deleteSwipe: {
  backgroundColor: "#F8ECEA",
  borderWidth: 1.5,
  borderColor: "#C54B3D",
  justifyContent: "center",
  alignItems: "center",
  width: 70,
  borderRadius: 16,
  marginBottom: 12,
},
itemBoxBought: {
  backgroundColor: "#F1F3F2",
  borderWidth: 1,
  borderColor: "#E1E5E2",
},
header: {
  backgroundColor: "#EAF5EE",
  marginHorizontal: -20,
  marginTop: -20,
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 18,
  marginBottom: 16,
},
shopHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 20,
  marginBottom: 10,
  gap: 10,
},

shopCircleBig: {
  width: 36,
  height: 36,
  borderRadius: 18,
  borderWidth: 1.5,
  justifyContent: "center",
  alignItems: "center",
},

shopCircleText: {
  fontWeight: "700",
},

shopTitle: {
  fontSize: 22,
  fontWeight: "800",
  color: "#162018",
},
categoryHeader: {
  backgroundColor: "#F7F8F7",
  borderRadius: 16,
  borderWidth: 1.5,
  borderColor: "#DCE3DD",
  paddingVertical: 12,
  paddingHorizontal: 14,
  marginBottom: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

categoryTitle: {
  fontSize: 15,
  fontWeight: "700",
  color: "#2E9B57",
},

kupioneHeader: {
  fontSize: 18,
  fontWeight: "800",
  color: "#6A746C",
  marginTop: 18,
  marginBottom: 12,
},
categoryHeaderActive: {
  backgroundColor: "#EAF5EE",
  borderColor: "#2E9B57",
},
categoryLeft: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},
});
