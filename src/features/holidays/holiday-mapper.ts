import type { CountryCode } from '@/constants/countries';

import type { Holiday, NagerHolidayDto } from './types';

export function createHolidayExternalId(
  countryCode: CountryCode,
  date: string,
  name: string,
): string {
  const normalizedName = name
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, '-');

  return `${countryCode}|${date}|${normalizedName}`;
}

export function normalizeNagerHoliday(
  dto: NagerHolidayDto,
  countryCode: CountryCode,
): Holiday {
  return {
    externalId: createHolidayExternalId(countryCode, dto.date, dto.name),
    countryCode,
    date: dto.date,
    localName: dto.localName.trim(),
    name: dto.name.trim(),
  };
}
