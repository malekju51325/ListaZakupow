import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Lista" }} />
      <Tabs.Screen name="settings" options={{ title: "Ustawienia" }} />
    </Tabs>
  );
}
