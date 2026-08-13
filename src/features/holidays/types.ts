import type { CountryCode } from '@/constants/countries';

export type NagerHolidayDto = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
};

export type Holiday = {
  externalId: string;
  countryCode: CountryCode;
  date: string;
  localName: string;
  name: string;
};
