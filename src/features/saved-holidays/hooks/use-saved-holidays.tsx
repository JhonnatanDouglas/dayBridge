import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Holiday } from '@/features/holidays/types';
import { getUserMessage, UserFacingError } from '@/utils/errors';

import {
  createSavedHoliday,
  deleteSavedHoliday,
  listSavedHolidays,
} from '../api/saved-holidays-service';
import type { SavedHoliday } from '../types';

type SavedHolidaysContextValue = {
  savedHolidays: SavedHoliday[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  actionError: string | null;
  pendingExternalIds: ReadonlySet<string>;
  isSaved: (externalId: string) => boolean;
  saveHoliday: (holiday: Holiday) => Promise<void>;
  removeHoliday: (externalId: string) => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  clearActionError: () => void;
};

const SavedHolidaysContext = createContext<
  SavedHolidaysContextValue | undefined
>(undefined);

type SavedHolidaysProviderProps = PropsWithChildren<{ userId: string }>;

function sortSavedHolidays(items: SavedHoliday[]): SavedHoliday[] {
  return [...items].sort(
    (first, second) =>
      first.date.localeCompare(second.date) ||
      first.localName.localeCompare(second.localName),
  );
}

export function SavedHolidaysProvider({
  children,
  userId,
}: SavedHolidaysProviderProps) {
  const [savedHolidays, setSavedHolidays] = useState<SavedHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingExternalIds, setPendingExternalIds] = useState<Set<string>>(
    new Set(),
  );

  const loadSavedHolidays = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        setSavedHolidays(await listSavedHolidays(userId));
      } catch (caughtError: unknown) {
        setError(
          getUserMessage(
            caughtError,
            'Your saved holidays could not be loaded.',
          ),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    let isActive = true;

    void listSavedHolidays(userId)
      .then((items) => {
        if (isActive) {
          setSavedHolidays(items);
        }
      })
      .catch((caughtError: unknown) => {
        if (isActive) {
          setError(
            getUserMessage(
              caughtError,
              'Your saved holidays could not be loaded.',
            ),
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [userId]);

  const savedIds = useMemo(
    () => new Set(savedHolidays.map((holiday) => holiday.externalId)),
    [savedHolidays],
  );

  const markPending = useCallback((externalId: string, pending: boolean) => {
    setPendingExternalIds((current) => {
      const next = new Set(current);

      if (pending) {
        next.add(externalId);
      } else {
        next.delete(externalId);
      }

      return next;
    });
  }, []);

  const saveHoliday = useCallback(
    async (holiday: Holiday) => {
      if (savedIds.has(holiday.externalId)) {
        return;
      }

      setActionError(null);
      markPending(holiday.externalId, true);

      try {
        const savedHoliday = await createSavedHoliday(userId, holiday);
        setSavedHolidays((current) =>
          sortSavedHolidays([...current, savedHoliday]),
        );
      } catch (caughtError: unknown) {
        const message = getUserMessage(
          caughtError,
          'This holiday could not be saved. Please try again.',
        );
        setActionError(message);
        throw new UserFacingError(message);
      } finally {
        markPending(holiday.externalId, false);
      }
    },
    [markPending, savedIds, userId],
  );

  const removeHoliday = useCallback(
    async (externalId: string) => {
      const savedHoliday = savedHolidays.find(
        (holiday) => holiday.externalId === externalId,
      );

      if (!savedHoliday) {
        return;
      }

      setActionError(null);
      markPending(externalId, true);

      try {
        await deleteSavedHoliday(userId, savedHoliday.id);
        setSavedHolidays((current) =>
          current.filter((holiday) => holiday.externalId !== externalId),
        );
      } catch (caughtError: unknown) {
        const message = getUserMessage(
          caughtError,
          'This holiday could not be removed. Please try again.',
        );
        setActionError(message);
        throw new UserFacingError(message);
      } finally {
        markPending(externalId, false);
      }
    },
    [markPending, savedHolidays, userId],
  );

  const value = useMemo<SavedHolidaysContextValue>(
    () => ({
      savedHolidays,
      isLoading,
      isRefreshing,
      error,
      actionError,
      pendingExternalIds,
      isSaved: (externalId) => savedIds.has(externalId),
      saveHoliday,
      removeHoliday,
      refresh: () => loadSavedHolidays(true),
      retry: () => loadSavedHolidays(false),
      clearActionError: () => setActionError(null),
    }),
    [
      actionError,
      error,
      isLoading,
      isRefreshing,
      loadSavedHolidays,
      pendingExternalIds,
      removeHoliday,
      saveHoliday,
      savedHolidays,
      savedIds,
    ],
  );

  return (
    <SavedHolidaysContext.Provider value={value}>
      {children}
    </SavedHolidaysContext.Provider>
  );
}

export function useSavedHolidays(): SavedHolidaysContextValue {
  const context = useContext(SavedHolidaysContext);

  if (!context) {
    throw new Error(
      'useSavedHolidays must be used inside SavedHolidaysProvider.',
    );
  }

  return context;
}
