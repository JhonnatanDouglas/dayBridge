export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}

export function getUserMessage(error: unknown, fallback: string): string {
  return error instanceof UserFacingError ? error.message : fallback;
}

export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Something went wrong. Please try again in a moment.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }

  if (message.includes('email not confirmed')) {
    return 'Confirm your email before signing in.';
  }

  if (
    message.includes('already registered') ||
    message.includes('already exists')
  ) {
    return 'An account with this email already exists.';
  }

  if (message.includes('email rate limit exceeded')) {
    return 'Please wait a moment before requesting another email.';
  }

  if (message.includes('rate limit')) {
    return 'Too many attempts. Wait a moment and try again.';
  }

  return 'Your request could not be completed. Please try again.';
}
