import { Redirect } from 'expo-router';

import { useSession } from '@/providers/session-provider';

export default function IndexScreen() {
  const { session } = useSession();

  return <Redirect href={session ? '/(tabs)' : '/(auth)/sign-in'} />;
}
