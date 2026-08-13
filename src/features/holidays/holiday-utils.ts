import type { Holiday } from './types';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseLocalDate(value: string): Date {
  const match = ISO_DATE_PATTERN.exec(value);

  if (!match) {
    throw new Error('Invalid holiday date.');
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error('Invalid holiday date.');
  }

  return date;
}

export function formatHolidayDate(value: string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parseLocalDate(value));
}

export function toLocalIsoDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function filterAndSortUpcomingHolidays(
  holidays: Holiday[],
  today = new Date(),
): Holiday[] {
  const uniqueHolidays = new Map(
    holidays.map((holiday) => [holiday.externalId, holiday]),
  );
  const todayKey = toLocalIsoDate(today);

  return [...uniqueHolidays.values()]
    .filter((holiday) => holiday.date >= todayKey)
    .sort(
      (first, second) =>
        first.date.localeCompare(second.date) ||
        first.localName.localeCompare(second.localName),
    );
}
