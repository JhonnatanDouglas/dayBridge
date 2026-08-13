import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  icon,
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      className={`min-h-12 flex-row items-center justify-center rounded-lg px-5 ${
        isPrimary ? 'bg-blue-600' : 'border border-slate-300 bg-white'
      } ${isDisabled ? 'opacity-50' : ''}`}
      disabled={isDisabled}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#2563EB'} />
      ) : (
        <>
          {icon}
          <Text
            className={`text-base font-semibold ${
              isPrimary ? 'text-white' : 'text-blue-700'
            } ${icon ? 'ml-2' : ''}`}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
