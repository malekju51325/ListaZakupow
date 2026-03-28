import { router } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShopping } from "../context/ShoppingContext";

export default function AddScreen() {
  const [nazwa, setNazwa] = React.useState("");
  const [sklep, setSklep] = React.useState("");
  const [cena, setCena] = React.useState("");
  const { dodajProdukt } = useShopping();

 function dodajProduktHandler() {
   if (!nazwa || !sklep || !cena) {
    alert("Uzupełnij wszystkie pola");
    return;
  }
  const cenaNumber = Number(cena.replace(",", "."));
   if (isNaN(cenaNumber)) {
    alert("Cena musi być liczbą");
    return;
  }

  dodajProdukt(nazwa, sklep, cenaNumber);
  router.back();
}

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj produkt</Text>

      <TextInput
        placeholder="Nazwa produktu"
        value={nazwa}
        onChangeText={setNazwa}
        style={styles.input}
      />

      <TextInput
        placeholder="Sklep"
        value={sklep}
        onChangeText={setSklep}
        style={styles.input}
      />

      <TextInput
        placeholder="Cena"
        value={cena}
        onChangeText={setCena}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Zapisz produkt" onPress={dodajProduktHandler} />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8
  }
});