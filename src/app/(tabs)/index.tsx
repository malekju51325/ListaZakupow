import { Colors } from "@/constants/theme";
import { useShopping } from "@/context/ShoppingContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
  const { dane, sklepy,usunProdukt, toggleKupione } = useShopping();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
      { title: "Do kupienia", data: doKupienia },
      { title: "Kupione", data: kupione },
    ];
  }, [dane]);


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
      <Text style={styles.quantitySmall}>
        {item.ilosc} {item.jednostka === "kg" ? "g" : "szt."}
      </Text>

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
              return (
                <View style={styles.sectionHeader}>
                  <Text
  style={[
    styles.section,
    section.title === "Kupione" && styles.sectionBought,
  ]}
>
  {section.title.toUpperCase()}
</Text>
                  
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>Brak produktów</Text>}
          />
        ) : (
<SectionList
  sections={dane}
  keyExtractor={(_, index) => index.toString()}

  renderItem={({ item, section }) => (
    <Swipeable
      renderRightActions={() => (
        <Pressable
          onPress={() => usunProdukt(item, section.title)}
          style={styles.deleteSwipe}
        >
          <Ionicons name="trash-outline" size={22} color="#C54B3D" />
        </Pressable>
      )}
    >
      <View style={styles.itemBox}>
        
        {/* LEWA CZĘŚĆ */}
        <View style={styles.leftSection}>
          <Pressable onPress={() => toggleKupione(item, section.title)}>
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

        {/* PRAWA CZĘŚĆ */}
        <View style={styles.rightSectionRow}>
          <Text style={styles.quantitySmall}>
            {item.ilosc} {item.jednostka === "kg" ? "g" : "szt."}
          </Text>
        </View>

      </View>
    </Swipeable>
  )}

  renderSectionHeader={({ section }) => {
    const sklepObj = sklepy.find((s) => s.name === section.title);
    const kolor = sklepObj?.color || "#2E9B57";

    return (
      <View style={styles.shopHeader}>
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
            {section.title[0]}
          </Text>
        </View>

        <Text style={styles.shopTitle}>
          {section.title}
        </Text>
      </View>
    );
  }}
/>
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
  backgroundColor: "#EAF5EE",
  borderWidth: 1,
  borderColor: "#CFE8D8",
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
  fontSize: 16,
  fontWeight: "700",
  color: "#162018",
},
});
