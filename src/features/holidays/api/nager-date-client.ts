import { z } from 'zod';

import type { CountryCode } from '@/constants/countries';
import { UserFacingError } from '@/utils/errors';

import { normalizeNagerHoliday } from '../holiday-mapper';
import {
  filterAndSortUpcomingHolidays,
  parseLocalDate,
} from '../holiday-utils';
import type { Holiday, NagerHolidayDto } from '../types';

const NAGER_DATE_BASE_URL = 'https://date.nager.at/api/v3';
const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    try {
      parseLocalDate(value);
      return true;
    } catch {
      return false;
    }
  });
const nagerHolidaySchema = z.object({
  date: localDateSchema,
  localName: z.string().min(1),
  name: z.string().min(1),
  countryCode: z.string().length(2),
});
const nagerHolidayListSchema = z.array(nagerHolidaySchema);

export class HolidayProviderError extends UserFacingError {
  constructor(
    message = 'Holidays could not be loaded. Check your connection and try again.',
  ) {
    super(message);
    this.name = 'HolidayProviderError';
  }
}

async function fetchHolidaysForYear(
  year: number,
  countryCode: CountryCode,
  signal?: AbortSignal,
): Promise<NagerHolidayDto[]> {
  let response: Response;

  try {
    response = await fetch(
      `${NAGER_DATE_BASE_URL}/PublicHolidays/${year}/${countryCode}`,
      { signal },
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new HolidayProviderError();
  }

  if (!response.ok) {
    throw new HolidayProviderError();
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new HolidayProviderError(
      'The holiday provider returned an invalid response.',
    );
  }

  const result = nagerHolidayListSchema.safeParse(payload);

  if (!result.success) {
    throw new HolidayProviderError(
      'The holiday provider returned an invalid response.',
    );
  }

  return result.data;
}

export async function getUpcomingHolidays(
  countryCode: CountryCode,
  today = new Date(),
  signal?: AbortSignal,
): Promise<Holiday[]> {
  const currentYear = today.getFullYear();
  const responses = await Promise.all([
    fetchHolidaysForYear(currentYear, countryCode, signal),
    fetchHolidaysForYear(currentYear + 1, countryCode, signal),
  ]);
  const holidays = responses
    .flat()
    .map((dto) => normalizeNagerHoliday(dto, countryCode));

  return filterAndSortUpcomingHolidays(holidays, today);
}
