import { AlertCircle, CalendarDays } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';

import { AppButton } from './app-button';

type FeedbackStateProps = {
  kind: 'loading' | 'error' | 'empty';
  title: string;
  message?: string;
  onRetry?: () => void;
};

export function FeedbackState({
  kind,
  title,
  message,
  onRetry,
}: FeedbackStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {kind === 'loading' ? (
        <ActivityIndicator color="#2563EB" size="large" />
      ) : kind === 'error' ? (
        <AlertCircle color="#B91C1C" size={28} strokeWidth={1.8} />
      ) : (
        <CalendarDays color="#64748B" size={28} strokeWidth={1.8} />
      )}
      <Text className="mt-4 text-center text-lg font-semibold text-charcoal">
        {title}
      </Text>
      {message ? (
        <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-slate-600">
          {message}
        </Text>
      ) : null}
      {onRetry ? (
        <View className="mt-5 min-w-32">
          <AppButton label="Try again" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
