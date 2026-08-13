import { Bookmark } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { formatHolidayDate } from '../holiday-utils';
import type { Holiday } from '../types';

type HolidayRowProps = {
  holiday: Holiday;
  isSaved: boolean;
  isPending: boolean;
  onToggle: () => void;
};

export function HolidayRow({
  holiday,
  isSaved,
  isPending,
  onToggle,
}: HolidayRowProps) {
  return (
    <View className="min-h-24 flex-row items-center px-5 py-4">
      <View className="min-w-0 flex-1 pr-3">
        <Text className="text-base font-semibold leading-5 text-charcoal">
          {holiday.localName}
        </Text>
        {holiday.name !== holiday.localName ? (
          <Text className="mt-1 text-sm leading-5 text-slate-500">
            {holiday.name}
          </Text>
        ) : null}
        <Text className="mt-2 text-sm font-medium text-blue-700">
          {formatHolidayDate(holiday.date)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isSaved ? 'Remove from saved holidays' : 'Save holiday'
        }
        accessibilityState={{ disabled: isPending, selected: isSaved }}
        className="h-11 w-11 items-center justify-center rounded-lg"
        disabled={isPending}
        hitSlop={4}
        onPress={onToggle}
      >
        {isPending ? (
          <ActivityIndicator color="#2563EB" size="small" />
        ) : (
          <Bookmark
            color={isSaved ? '#2563EB' : '#64748B'}
            fill={isSaved ? '#DBEAFE' : 'transparent'}
            size={22}
            strokeWidth={1.9}
          />
        )}
      </Pressable>
    </View>
  );
}
