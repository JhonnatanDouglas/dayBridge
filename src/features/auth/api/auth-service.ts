import * as Linking from 'expo-linking';

import { requireSupabase } from '@/lib/supabase';

import type { SignInValues, SignUpValues } from '../schemas/auth-schema';

function getEmailRedirectTo(): string {
  return Linking.createURL('/');
}

export async function signIn(values: SignInValues): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithPassword({
    email: values.email.trim(),
    password: values.password,
  });

  if (error) {
    throw error;
  }
}

export async function signUp(
  values: SignUpValues,
): Promise<{ needsEmailConfirmation: boolean }> {
  const { data, error } = await requireSupabase().auth.signUp({
    email: values.email.trim(),
    password: values.password,
    options: {
      emailRedirectTo: getEmailRedirectTo(),
      data: {
        full_name: values.fullName.trim(),
      },
    },
  });

  if (error) {
    throw error;
  }

  return { needsEmailConfirmation: data.session === null };
}

export async function resendSignupConfirmation(email: string): Promise<void> {
  const { error } = await requireSupabase().auth.resend({
    type: 'signup',
    email: email.trim(),
    options: {
      emailRedirectTo: getEmailRedirectTo(),
    },
  });

  if (error) {
    throw error;
  }
}
