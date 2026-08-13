const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabaseConfig =
  supabaseUrl && supabasePublishableKey
    ? { url: supabaseUrl, publishableKey: supabasePublishableKey }
    : null;
