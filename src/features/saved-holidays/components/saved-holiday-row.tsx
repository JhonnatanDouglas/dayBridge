import { Trash2 } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { getCountryName } from '@/constants/countries';
import { formatHolidayDate } from '@/features/holidays/holiday-utils';

import type { SavedHoliday } from '../types';

type SavedHolidayRowProps = {
  holiday: SavedHoliday;
  isPending: boolean;
  onRemove: () => void;
};

export function SavedHolidayRow({
  holiday,
  isPending,
  onRemove,
}: SavedHolidayRowProps) {
  return (
    <View className="min-h-24 flex-row items-center px-5 py-4">
      <View className="min-w-0 flex-1 pr-3">
        <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {getCountryName(holiday.countryCode)}
        </Text>
        <Text className="mt-1 text-base font-semibold leading-5 text-charcoal">
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
        accessibilityLabel="Remove saved holiday"
        accessibilityState={{ disabled: isPending }}
        className="h-11 w-11 items-center justify-center rounded-lg"
        disabled={isPending}
        hitSlop={4}
        onPress={onRemove}
      >
        {isPending ? (
          <ActivityIndicator color="#2563EB" size="small" />
        ) : (
          <Trash2 color="#64748B" size={21} strokeWidth={1.9} />
        )}
      </Pressable>
    </View>
  );
}
