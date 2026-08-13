import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';

import { FeedbackState } from '@/components/ui/feedback-state';
import { InlineNotice } from '@/components/ui/inline-notice';
import { ScreenContainer } from '@/components/ui/screen-container';
import type { CountryCode } from '@/constants/countries';
import { CountrySelector } from '@/features/holidays/components/country-selector';
import { HolidayRow } from '@/features/holidays/components/holiday-row';
import { useHolidays } from '@/features/holidays/hooks/use-holidays';
import type { Holiday } from '@/features/holidays/types';
import { useSavedHolidays } from '@/features/saved-holidays/hooks/use-saved-holidays';
import { useSession } from '@/providers/session-provider';

function getFirstName(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'there';
  }

  return value.trim().split(/\s+/)[0];
}

export default function HolidaysScreen() {
  const { session } = useSession();
  const [countryCode, setCountryCode] = useState<CountryCode>('BR');
  const { holidays, isLoading, isRefreshing, error, refresh, retry } =
    useHolidays(countryCode);
  const saved = useSavedHolidays();
  const firstName = getFirstName(session?.user.user_metadata.full_name);

  const refreshAll = async () => {
    await Promise.allSettled([refresh(), saved.refresh()]);
  };

  const toggleHoliday = async (holiday: Holiday) => {
    try {
      if (saved.isSaved(holiday.externalId)) {
        await saved.removeHoliday(holiday.externalId);
      } else {
        await saved.saveHoliday(holiday);
      }
    } catch {
      // The provider exposes a user-facing message beside the list.
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-1 md:flex-row">
        <View className="border-b border-slate-200 bg-slate-50 px-5 pb-5 pt-5 md:w-80 md:border-b-0 md:border-r md:px-7 md:py-8">
          <View className="mb-5 hidden h-11 w-11 items-center justify-center rounded-lg bg-blue-100 md:flex">
            <CalendarDays color="#2563EB" size={23} strokeWidth={1.8} />
          </View>
          <Text className="text-2xl font-semibold tracking-tight text-charcoal">
            Hello, {firstName}
          </Text>
          <Text className="mb-6 mt-2 text-sm leading-5 text-slate-600">
            Find upcoming public holidays and save the dates that matter to you.
          </Text>
          <CountrySelector
            onChange={setCountryCode}
            selectedCode={countryCode}
          />
          {saved.error ? (
            <View className="mt-5">
              <InlineNotice
                message="Your saved holidays are temporarily unavailable. Refresh the Saved tab to reconnect."
                tone="warning"
              />
            </View>
          ) : null}
          {saved.actionError ? (
            <View className="mt-3">
              <InlineNotice
                message={saved.actionError}
                onDismiss={saved.clearActionError}
              />
            </View>
          ) : null}
        </View>

        <View className="min-h-0 flex-1 bg-white">
          <View className="border-b border-slate-200 px-5 py-4 md:px-6">
            <Text className="text-lg font-semibold text-charcoal">
              Upcoming holidays
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              {isLoading
                ? 'Loading dates...'
                : `${holidays.length} dates available`}
            </Text>
          </View>
          <FlatList
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            data={isLoading ? [] : holidays}
            ItemSeparatorComponent={() => (
              <View className="mx-5 h-px bg-slate-200" />
            )}
            keyExtractor={(holiday) => holiday.externalId}
            ListEmptyComponent={
              isLoading ? (
                <FeedbackState kind="loading" title="Loading holidays" />
              ) : error ? (
                <FeedbackState
                  kind="error"
                  message={error}
                  onRetry={() => void retry()}
                  title="Holidays are unavailable"
                />
              ) : (
                <FeedbackState
                  kind="empty"
                  message="Try another country or check again later."
                  title="No upcoming holidays"
                />
              )
            }
            refreshControl={
              <RefreshControl
                colors={['#2563EB']}
                onRefresh={() => void refreshAll()}
                refreshing={isRefreshing || saved.isRefreshing}
                tintColor="#2563EB"
              />
            }
            renderItem={({ item }) => (
              <HolidayRow
                holiday={item}
                isPending={saved.pendingExternalIds.has(item.externalId)}
                isSaved={saved.isSaved(item.externalId)}
                onToggle={() => void toggleHoliday(item)}
              />
            )}
            showsVerticalScrollIndicator
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
