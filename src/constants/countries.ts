export const COUNTRIES = [
  { code: 'BR', label: 'BR', name: 'Brazil' },
  { code: 'US', label: 'US', name: 'United States' },
  { code: 'GB', label: 'UK', name: 'United Kingdom' },
  { code: 'CA', label: 'CA', name: 'Canada' },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]['code'];

export function getCountryName(code: CountryCode): string {
  return COUNTRIES.find((country) => country.code === code)?.name ?? code;
}
