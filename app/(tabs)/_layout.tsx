import { Tabs } from 'expo-router';
import { Bookmark, CalendarDays, LogOut } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  useWindowDimensions,
} from 'react-native';

import { SavedHolidaysProvider } from '@/features/saved-holidays/hooks/use-saved-holidays';
import { useSession } from '@/providers/session-provider';

export default function TabsLayout() {
  const { session, signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const headerSideInset = isDesktop ? Math.max(16, (width - 1024) / 2) : 8;

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error: unknown) {
      Alert.alert(
        'Unable to sign out',
        error instanceof Error
          ? error.message
          : 'Please try again in a moment.',
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const logoutButton = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      accessibilityState={{ busy: isSigningOut, disabled: isSigningOut }}
      className="h-11 w-11 items-center justify-center rounded-lg"
      disabled={isSigningOut}
      hitSlop={4}
      onPress={() => void handleSignOut()}
      style={{ marginRight: headerSideInset }}
    >
      {isSigningOut ? (
        <ActivityIndicator color="#2563EB" size="small" />
      ) : (
        <LogOut color="#334155" size={21} strokeWidth={1.9} />
      )}
    </Pressable>
  );

  return (
    <SavedHolidaysProvider userId={session.user.id}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerShadowVisible: true,
          headerTitle: 'DayBridge',
          headerTitleContainerStyle: { marginLeft: headerSideInset },
          headerTitleStyle: { color: '#172033', fontWeight: '700' },
          headerRight: logoutButton,
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#64748B',
          tabBarStyle: isDesktop
            ? {
                alignSelf: 'center',
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: 8,
                borderTopWidth: 1,
                borderWidth: 1,
                elevation: 2,
                height: 60,
                marginBottom: 16,
                marginTop: 8,
                paddingBottom: 7,
                paddingTop: 7,
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                width: 420,
              }
            : {
                borderTopColor: '#E2E8F0',
                backgroundColor: '#FFFFFF',
                height: 76,
                paddingBottom: 10,
                paddingTop: 8,
              },
          tabBarIconStyle: { marginTop: 0 },
          tabBarItemStyle: { minHeight: 54, paddingVertical: 2 },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 16,
            marginBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Holidays',
            tabBarIcon: ({ color, size }) => (
              <CalendarDays color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarIcon: ({ color, size }) => (
              <Bookmark color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </SavedHolidaysProvider>
  );
}
