import { KeyRound } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ConfigurationMissingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-canvas px-6">
      <View className="mx-auto w-full max-w-md flex-1 justify-center py-10">
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <KeyRound color="#2563EB" size={24} strokeWidth={1.8} />
        </View>
        <Text className="mt-6 text-3xl font-semibold tracking-tight text-charcoal">
          Setup required
        </Text>
        <Text className="mt-3 text-base leading-6 text-slate-600">
          DayBridge needs its Supabase connection details before it can start.
          Add the two public values below to a local .env file, then restart the
          app.
        </Text>
        <View className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <Text selectable className="font-mono text-sm text-slate-700">
            EXPO_PUBLIC_SUPABASE_URL
          </Text>
          <View className="my-3 h-px bg-slate-200" />
          <Text selectable className="font-mono text-sm text-slate-700">
            EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          </Text>
        </View>
        <Text className="mt-5 text-sm leading-5 text-slate-500">
          Use only the publishable client key. Never add a service role key to a
          mobile application.
        </Text>
      </View>
    </SafeAreaView>
  );
}
