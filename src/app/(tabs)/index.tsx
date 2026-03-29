import { useShopping } from "@/context/ShoppingContext";
import { router } from "expo-router";
import React from "react";
import {
  Button,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [filtrSklep, setFiltrSklep] = React.useState("");
  const { dane, usunProdukt, toggleKupione } = useShopping();

  const wszystkieProdukty = dane.flatMap((sekcja) =>
    sekcja.data.map((item) => ({
      ...item,
      sklep: sekcja.title,
    })),
  );

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const doKupienia = wszystkieProdukty.filter((p) => !p.kupione);
  const kupione = wszystkieProdukty.filter((p) => p.kupione);

  const sections = [
    { title: "Do kupienia", data: doKupienia },
    { title: "Kupione", data: kupione },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View style={[styles.container, { padding: width < 400 ? 10 : 20 }]}>
        <Text style={styles.title}>Lista zakupów</Text>
        <TextInput
          placeholder="Filtruj po sklepie"
          value={filtrSklep}
          onChangeText={setFiltrSklep}
          style={styles.input}
        />

        <Button title="Dodaj produkt" onPress={() => router.push("/add")} />
        <SectionList
          sections={sections}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, section }) => (
            <View
              style={[
                styles.itemBox,
                {
                  flexDirection: isSmallScreen ? "column" : "row",
                  gap: width < 400 ? 10 : 0,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={item.kupione ? styles.boughtText : styles.itemText}
                >
                  {item.nazwa}
                </Text>
                <Text>Cena: {item.cena} zł</Text>
                <Text>Sklep: {item.sklep}</Text>
              </View>

              <View>
                <Pressable
                  style={styles.smallButton}
                  onPress={() => toggleKupione(item, item.sklep)}
                >
                  <Text style={styles.buttonText}>Kupione</Text>
                </Pressable>

                <Pressable
                  style={[styles.smallButton, { backgroundColor: "darkred" }]}
                  onPress={() => usunProdukt(item, item.sklep)}
                >
                  <Text style={styles.buttonText}>Usuń</Text>
                </Pressable>
              </View>
            </View>
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.section}>{section.title}</Text>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Brak produktów</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 6,
    color: "#34495e",
  },
  item: {
    fontSize: 16,
    padding: 12,
    backgroundColor: "white",
    marginTop: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
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
    color: "gray",
  },
  itemBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  itemText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  boughtText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    textDecorationLine: "line-through",
  },

  smallButton: {
    backgroundColor: "darkgreen",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
