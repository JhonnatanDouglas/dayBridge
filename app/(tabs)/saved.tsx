import { Bookmark } from 'lucide-react-native';
import { FlatList, RefreshControl, Text, View } from 'react-native';

import { FeedbackState } from '@/components/ui/feedback-state';
import { InlineNotice } from '@/components/ui/inline-notice';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SavedHolidayRow } from '@/features/saved-holidays/components/saved-holiday-row';
import { useSavedHolidays } from '@/features/saved-holidays/hooks/use-saved-holidays';

export default function SavedScreen() {
  const saved = useSavedHolidays();

  return (
    <ScreenContainer>
      <View className="flex-1 md:flex-row">
        <View className="border-b border-slate-200 bg-slate-50 px-5 pb-5 pt-5 md:w-80 md:border-b-0 md:border-r md:px-7 md:py-8">
          <View className="mb-5 hidden h-11 w-11 items-center justify-center rounded-lg bg-blue-100 md:flex">
            <Bookmark color="#2563EB" size={23} strokeWidth={1.8} />
          </View>
          <Text className="text-2xl font-semibold tracking-tight text-charcoal">
            Saved dates
          </Text>
          <Text className="mt-2 text-sm leading-5 text-slate-600">
            Keep your selected holidays in one place and remove them whenever
            you no longer need them.
          </Text>
          {!saved.isLoading && !saved.error ? (
            <View className="mt-6 self-start rounded-lg bg-blue-50 px-3 py-2">
              <Text className="text-sm font-semibold text-blue-700">
                {saved.savedHolidays.length}{' '}
                {saved.savedHolidays.length === 1
                  ? 'saved date'
                  : 'saved dates'}
              </Text>
            </View>
          ) : null}
          {saved.actionError ? (
            <View className="mt-5">
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
              Your holidays
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              Sorted by the nearest date first.
            </Text>
          </View>
          <FlatList
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            data={saved.isLoading ? [] : saved.savedHolidays}
            ItemSeparatorComponent={() => (
              <View className="mx-5 h-px bg-slate-200" />
            )}
            keyExtractor={(holiday) => holiday.id}
            ListEmptyComponent={
              saved.isLoading ? (
                <FeedbackState kind="loading" title="Loading your holidays" />
              ) : saved.error ? (
                <FeedbackState
                  kind="error"
                  message="Your saved holidays could not be loaded. Check your connection and try again."
                  onRetry={() => void saved.retry()}
                  title="Unable to load saved holidays"
                />
              ) : (
                <FeedbackState
                  kind="empty"
                  message="Select the bookmark icon beside a holiday to add it here."
                  title="No saved holidays yet"
                />
              )
            }
            refreshControl={
              <RefreshControl
                colors={['#2563EB']}
                onRefresh={() => void saved.refresh()}
                refreshing={saved.isRefreshing}
                tintColor="#2563EB"
              />
            }
            renderItem={({ item }) => (
              <SavedHolidayRow
                holiday={item}
                isPending={saved.pendingExternalIds.has(item.externalId)}
                onRemove={() => {
                  void saved
                    .removeHoliday(item.externalId)
                    .catch(() => undefined);
                }}
              />
            )}
            showsVerticalScrollIndicator
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
