import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConfigurationMissingScreen } from '@/components/configuration-missing-screen';
import { SessionProvider, useSession } from '@/providers/session-provider';

function AppNavigator() {
  const { isConfigured, isLoading, session } = useSession();

  if (!isConfigured) {
    return <ConfigurationMissingScreen />;
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <ActivityIndicator color="#2563EB" size="large" />
        <Text className="mt-4 text-base text-slate-600">
          Getting things ready...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={session !== null}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SessionProvider>
        <AppNavigator />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
