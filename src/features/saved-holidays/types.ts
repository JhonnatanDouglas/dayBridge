import type { CountryCode } from '@/constants/countries';

export type SavedHoliday = {
  id: string;
  userId: string;
  externalId: string;
  countryCode: CountryCode;
  date: string;
  localName: string;
  name: string;
  createdAt: string;
};
