import { Pressable, Text, View } from 'react-native';

import { COUNTRIES, type CountryCode } from '@/constants/countries';

type CountrySelectorProps = {
  selectedCode: CountryCode;
  onChange: (code: CountryCode) => void;
};

export function CountrySelector({
  selectedCode,
  onChange,
}: CountrySelectorProps) {
  return (
    <View>
      <Text className="mb-3 text-sm font-medium text-charcoal">Country</Text>
      <View className="flex-row flex-wrap gap-2">
        {COUNTRIES.map((country) => {
          const selected = country.code === selectedCode;

          return (
            <Pressable
              key={country.code}
              accessibilityRole="button"
              accessibilityLabel={`Show holidays for ${country.name}`}
              accessibilityState={{ selected }}
              className={`min-h-11 min-w-12 items-center justify-center rounded-lg border px-3 ${
                selected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-300 bg-white'
              }`}
              onPress={() => onChange(country.code)}
            >
              <Text
                className={`text-sm font-semibold ${
                  selected ? 'text-blue-700' : 'text-slate-600'
                }`}
              >
                {country.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
