import { useShopping } from "@/context/ShoppingContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddScreen() {
  const [nazwa, setNazwa] = React.useState("");
  const [sklep, setSklep] = React.useState("");
  const { dodajProdukt, sklepy, kategorie } = useShopping();
  const [ilosc, setIlosc] = React.useState(1);
  const [jednostka, setJednostka] = React.useState("szt");
  const [showUnits, setShowUnits] = React.useState(false);
  const [kategoria, setKategoria] = React.useState("");

  function dodajProduktHandler() {
  if (!sklep) {
    alert("Wybierz sklep");
    return;
  }

  if (!nazwa.trim() || !sklep.trim()) {
    alert("Uzupełnij wszystkie pola");
    return;
  }

  dodajProdukt(
    nazwa.trim(),
    sklep.trim(),
    ilosc,
    jednostka,
    kategoria
  );


  setNazwa("");
  setSklep("");
  setIlosc(1);
  setJednostka("szt");
  setKategoria("");
  setShowUnits(false);

  router.back();
}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8F7" }}>
      <View style={styles.container}>

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
          <View style={styles.row}>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Ilość</Text>
              <View style={styles.stepper}>
                <Pressable onPress={() => {
                  if (jednostka === "szt") {
                    setIlosc(prev => Math.max(1, prev - 1));
                  } else {
                    setIlosc(prev => Math.max(50, prev - 50));
                  }
                }}>
                  <Text style={styles.stepBtn}>−</Text>
                </Pressable>

                <Text style={styles.stepValue}>
                  {jednostka === "szt" ? ilosc : `${ilosc} g`}
                </Text>

                <Pressable onPress={() => {
                  if (jednostka === "szt") {
                    setIlosc(prev => prev + 1);
                  } else {
                    setIlosc(prev => prev + 50);
                  }
                }}>
                  <Text style={styles.stepBtn}>+</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Jednostka</Text>

              <Pressable
                style={styles.dropdown}
                onPress={() => setShowUnits(!showUnits)}
              >
                <Text style={styles.dropdownText}>{jednostka}</Text>
                <Ionicons name="chevron-down" size={18} color="#6A746C" />
              </Pressable>

              {showUnits && (
                <View style={styles.dropdownList}>
                  {["szt", "kg"].map(j => (
                    <Pressable
                      key={j}
                      onPress={() => {
                        setJednostka(j);
                        setShowUnits(false);

                        if (j === "szt") {
                          setIlosc(1);
                        } else {
                          setIlosc(50);
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
                      backgroundColor: isActive ? `${s.color}20` : "#F1F3F2",
                      borderColor: isActive ? s.color : "#E1E5E2",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isActive ? s.color : "#162018" },
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#162018",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#6A746C",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#F7F8F7",
    fontWeight: "600",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#2E9B57",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    color: "#6A746C",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F8F7",
    borderRadius: 14,
    padding: 10,
  },

  stepBtn: {
    fontSize: 20,
    color: "#2E9B57",
    paddingHorizontal: 10,
  },

  stepValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 6,
    elevation: 3,
  },

  dropdownItem: {
    padding: 10,
  },
  dropdown: {
    backgroundColor: "#F7F8F7",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#162018",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "600",
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F1F3F2",
    borderWidth: 1,
    borderColor: "#E1E5E2",
  },

  categoryChipActive: {
    backgroundColor: "#EAF5EE",
    borderColor: "#2E9B57",
  },

  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#162018",
  },

  categoryChipTextActive: {
    color: "#2E9B57",
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
});
