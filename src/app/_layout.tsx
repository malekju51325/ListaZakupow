import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ShoppingProvider } from "../context/ShoppingContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
  <ShoppingProvider>
    <Stack />
  </ShoppingProvider>
</SafeAreaProvider>
  );
}