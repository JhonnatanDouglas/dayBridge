import { z } from 'zod';

import type { Holiday } from '@/features/holidays/types';
import { requireSupabase } from '@/lib/supabase';
import { UserFacingError } from '@/utils/errors';

import type { SavedHoliday } from '../types';

const savedHolidayRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  external_id: z.string().min(1),
  country_code: z.enum(['BR', 'US', 'GB', 'CA']),
  holiday_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  local_name: z.string().min(1),
  name: z.string().min(1),
  created_at: z.string().min(1),
});

const savedHolidayColumns =
  'id,user_id,external_id,country_code,holiday_date,local_name,name,created_at';

export class SavedHolidayAlreadyExistsError extends UserFacingError {
  constructor() {
    super('This holiday is already saved.');
    this.name = 'SavedHolidayAlreadyExistsError';
  }
}

function mapSavedHoliday(value: unknown): SavedHoliday {
  const parsed = savedHolidayRowSchema.safeParse(value);

  if (!parsed.success) {
    throw new UserFacingError(
      'Saved holiday data is invalid. Please try again.',
    );
  }

  return {
    id: parsed.data.id,
    userId: parsed.data.user_id,
    externalId: parsed.data.external_id,
    countryCode: parsed.data.country_code,
    date: parsed.data.holiday_date,
    localName: parsed.data.local_name,
    name: parsed.data.name,
    createdAt: parsed.data.created_at,
  };
}

export async function listSavedHolidays(
  userId: string,
): Promise<SavedHoliday[]> {
  const { data, error } = await requireSupabase()
    .from('saved_holidays')
    .select(savedHolidayColumns)
    .eq('user_id', userId)
    .order('holiday_date', { ascending: true });

  if (error) {
    throw new UserFacingError('Your saved holidays could not be loaded.');
  }

  return (data ?? []).map(mapSavedHoliday);
}

export async function createSavedHoliday(
  userId: string,
  holiday: Holiday,
): Promise<SavedHoliday> {
  const { data, error } = await requireSupabase()
    .from('saved_holidays')
    .insert({
      user_id: userId,
      external_id: holiday.externalId,
      country_code: holiday.countryCode,
      holiday_date: holiday.date,
      local_name: holiday.localName,
      name: holiday.name,
    })
    .select(savedHolidayColumns)
    .single();

  if (error?.code === '23505') {
    throw new SavedHolidayAlreadyExistsError();
  }

  if (error || !data) {
    throw new UserFacingError(
      'This holiday could not be saved. Please try again.',
    );
  }

  return mapSavedHoliday(data);
}

export async function deleteSavedHoliday(
  userId: string,
  savedHolidayId: string,
): Promise<void> {
  const { error } = await requireSupabase()
    .from('saved_holidays')
    .delete()
    .eq('id', savedHolidayId)
    .eq('user_id', userId);

  if (error) {
    throw new UserFacingError(
      'This holiday could not be removed. Please try again.',
    );
  }
}
