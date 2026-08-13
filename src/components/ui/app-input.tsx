import type { ReactNode } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  rightAction?: ReactNode;
};

export function AppInput({
  label,
  error,
  rightAction,
  ...inputProps
}: AppInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-charcoal">{label}</Text>
      <View
        className={`min-h-12 flex-row items-center overflow-hidden rounded-lg border bg-white px-3 ${
          error ? 'border-red-500' : 'border-slate-300'
        }`}
      >
        <TextInput
          accessibilityLabel={label}
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-charcoal outline-none"
          placeholderTextColor="#94A3B8"
          {...inputProps}
        />
        {rightAction}
      </View>
      {error ? (
        <Text className="mt-1 text-sm text-red-700">{error}</Text>
      ) : null}
    </View>
  );
}
