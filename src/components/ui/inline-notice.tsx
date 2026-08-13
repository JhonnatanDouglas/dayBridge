import { AlertCircle, Info, X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type InlineNoticeProps = {
  message: string;
  tone?: 'error' | 'warning';
  onDismiss?: () => void;
};

export function InlineNotice({
  message,
  tone = 'error',
  onDismiss,
}: InlineNoticeProps) {
  const isError = tone === 'error';
  const color = isError ? '#B91C1C' : '#92400E';

  return (
    <View
      accessibilityRole="alert"
      className={`flex-row items-start rounded-lg border p-3 ${
        isError ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      {isError ? (
        <AlertCircle color={color} size={18} strokeWidth={1.9} />
      ) : (
        <Info color={color} size={18} strokeWidth={1.9} />
      )}
      <Text
        className={`ml-2 min-w-0 flex-1 text-sm leading-5 ${
          isError ? 'text-red-800' : 'text-amber-900'
        }`}
      >
        {message}
      </Text>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
          className="ml-2 h-8 w-8 items-center justify-center rounded-lg"
          hitSlop={4}
          onPress={onDismiss}
        >
          <X color={color} size={17} />
        </Pressable>
      ) : null}
    </View>
  );
}
