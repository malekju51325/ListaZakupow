import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ustawienia</Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Wyczyść listę</Text>
      </Pressable>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Tryb ciemny (wkrótce)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "royalblue",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
