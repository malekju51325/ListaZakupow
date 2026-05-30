import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ShoppingTheme } from '@/constants/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ShoppingProvider } from '../context/ShoppingContext';

const { colors } = ShoppingTheme;

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ShoppingProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="product-details"
                options={{
                  presentation: 'modal',
                  title: 'Szczegóły produktu',
                }}
              />
            </Stack>
          </ShoppingProvider>
        </ErrorBoundary>
        <StatusBar backgroundColor={colors.background} style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
