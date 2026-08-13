import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ScreenContainer({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['left', 'right']}>
      <View className="mx-auto w-full max-w-5xl flex-1 overflow-hidden bg-white md:my-6 md:max-h-[1250px] md:rounded-lg md:border md:border-slate-200 md:shadow-sm">
        {children}
      </View>
    </SafeAreaView>
  );
}
