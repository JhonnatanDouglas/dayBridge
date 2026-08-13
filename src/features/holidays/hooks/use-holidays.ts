import { useCallback, useEffect, useRef, useState } from 'react';

import type { CountryCode } from '@/constants/countries';
import { getUserMessage } from '@/utils/errors';

import { getUpcomingHolidays } from '../api/nager-date-client';
import type { Holiday } from '../types';

export function useHolidays(countryCode: CountryCode) {
  const [result, setResult] = useState<{
    countryCode: CountryCode;
    holidays: Holiday[];
    error: string | null;
    status: 'loading' | 'success' | 'error';
  }>({ countryCode, holidays: [], error: null, status: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const fetchAndStoreHolidays = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const nextHolidays = await getUpcomingHolidays(
        countryCode,
        new Date(),
        controller.signal,
      );
      setResult({
        countryCode,
        holidays: nextHolidays,
        error: null,
        status: 'success',
      });
    } catch (caughtError: unknown) {
      if (caughtError instanceof Error && caughtError.name === 'AbortError') {
        return;
      }

      setResult({
        countryCode,
        holidays: [],
        error: getUserMessage(
          caughtError,
          'Holidays could not be loaded. Check your connection and try again.',
        ),
        status: 'error',
      });
    } finally {
      if (requestRef.current === controller) {
        setIsRefreshing(false);
      }
    }
  }, [countryCode]);

  useEffect(() => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    void getUpcomingHolidays(countryCode, new Date(), controller.signal)
      .then((nextHolidays) => {
        setResult({
          countryCode,
          holidays: nextHolidays,
          error: null,
          status: 'success',
        });
      })
      .catch((caughtError: unknown) => {
        if (caughtError instanceof Error && caughtError.name === 'AbortError') {
          return;
        }

        setResult({
          countryCode,
          holidays: [],
          error: getUserMessage(
            caughtError,
            'Holidays could not be loaded. Check your connection and try again.',
          ),
          status: 'error',
        });
      });

    return () => controller.abort();
  }, [countryCode]);

  const isCurrentCountry = result.countryCode === countryCode;

  return {
    holidays: isCurrentCountry ? result.holidays : [],
    isLoading: !isCurrentCountry || result.status === 'loading',
    isRefreshing,
    error: isCurrentCountry ? result.error : null,
    refresh: async () => {
      setIsRefreshing(true);
      await fetchAndStoreHolidays();
    },
    retry: async () => {
      setResult({ countryCode, holidays: [], error: null, status: 'loading' });
      await fetchAndStoreHolidays();
    },
  };
}
