import { signInSchema, signUpSchema } from '../schemas/auth-schema';

describe('authentication schemas', () => {
  test('rejects sign-up when password confirmation is different', () => {
    const result = signUpSchema.safeParse({
      fullName: 'Jhonnatan Silva',
      email: 'jhonnatan@example.com',
      password: 'strong-pass',
      confirmPassword: 'another-pass',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
        'Passwords do not match.',
      );
    }
  });

  test('rejects an invalid sign-in email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'strong-pass',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain(
        'Enter a valid email address.',
      );
    }
  });
});
