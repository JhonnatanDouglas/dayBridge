import {
  createHolidayExternalId,
  normalizeNagerHoliday,
} from '../holiday-mapper';
import {
  filterAndSortUpcomingHolidays,
  formatHolidayDate,
  parseLocalDate,
} from '../holiday-utils';
import type { Holiday, NagerHolidayDto } from '../types';

const providerHoliday: NagerHolidayDto = {
  date: '2026-09-07',
  localName: 'Independência do Brasil',
  name: 'Independence Day',
  countryCode: 'BR',
};

describe('holiday mapping and date utilities', () => {
  test('creates a deterministic external identifier', () => {
    expect(
      createHolidayExternalId('BR', '2026-09-07', 'Independence Day'),
    ).toBe('BR|2026-09-07|independence-day');
    expect(
      createHolidayExternalId('BR', '2026-09-07', ' Independence   Day '),
    ).toBe('BR|2026-09-07|independence-day');
  });

  test('normalizes a provider DTO into the internal model', () => {
    expect(normalizeNagerHoliday(providerHoliday, 'BR')).toEqual({
      externalId: 'BR|2026-09-07|independence-day',
      countryCode: 'BR',
      date: '2026-09-07',
      localName: 'Independência do Brasil',
      name: 'Independence Day',
    });
  });

  test('filters past dates, removes duplicates, and sorts upcoming holidays', () => {
    const holidays: Holiday[] = [
      normalizeNagerHoliday(
        { ...providerHoliday, date: '2026-12-25', name: 'Christmas Day' },
        'BR',
      ),
      normalizeNagerHoliday(providerHoliday, 'BR'),
      normalizeNagerHoliday(providerHoliday, 'BR'),
      normalizeNagerHoliday(
        { ...providerHoliday, date: '2026-01-01', name: "New Year's Day" },
        'BR',
      ),
    ];

    expect(
      filterAndSortUpcomingHolidays(holidays, new Date(2026, 7, 12)).map(
        (holiday) => holiday.date,
      ),
    ).toEqual(['2026-09-07', '2026-12-25']);
  });

  test('parses and formats ISO dates in local time without a UTC day shift', () => {
    const date = parseLocalDate('2026-01-01');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
    expect(formatHolidayDate('2026-01-01', 'en-US')).toBe('Thu, Jan 1, 2026');
  });
});
