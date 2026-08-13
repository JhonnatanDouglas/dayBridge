import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, CalendarDays, Eye, EyeOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { getAuthErrorMessage } from '@/utils/errors';

import { resendSignupConfirmation, signIn, signUp } from '../api/auth-service';
import {
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from '../schemas/auth-schema';

const RESEND_CONFIRMATION_COOLDOWN_SECONDS = 60;

type PasswordToggleProps = {
  visible: boolean;
  onPress: () => void;
};

function getResendConfirmationLabel(remainingSeconds: number): string {
  return remainingSeconds > 0
    ? `Resend confirmation email (${remainingSeconds}s)`
    : 'Resend confirmation email';
}

function useConfirmationCooldown() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [remainingSeconds]);

  return {
    clearCooldown: () => setRemainingSeconds(0),
    remainingSeconds,
    startCooldown: () =>
      setRemainingSeconds(RESEND_CONFIRMATION_COOLDOWN_SECONDS),
  };
}

function PasswordToggle({ visible, onPress }: PasswordToggleProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      className="h-11 w-11 items-center justify-center"
      hitSlop={4}
      onPress={onPress}
    >
      {visible ? (
        <EyeOff color="#475569" size={20} />
      ) : (
        <Eye color="#475569" size={20} />
      )}
    </Pressable>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 8,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">
            <View className="mb-8 h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <CalendarDays color="#2563EB" size={25} strokeWidth={1.8} />
            </View>
            <Text className="text-3xl font-semibold tracking-tight text-charcoal">
              {title}
            </Text>
            <Text className="mb-8 mt-3 text-base leading-6 text-slate-600">
              {subtitle}
            </Text>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SignInForm() {
  const [requestError, setRequestError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null,
  );
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    clearCooldown: clearResendCooldown,
    remainingSeconds: resendCooldownSeconds,
    startCooldown: startResendCooldown,
  } = useConfirmationCooldown();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    setRequestError(null);
    setConfirmationEmail(null);
    setResendMessage(null);
    clearResendCooldown();

    try {
      await signIn(values);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('email not confirmed')
      ) {
        setConfirmationEmail(values.email.trim());
        startResendCooldown();
      }

      setRequestError(getAuthErrorMessage(error));
    }
  });

  const resendConfirmation = async () => {
    if (!confirmationEmail) {
      return;
    }

    setRequestError(null);
    setResendMessage(null);
    startResendCooldown();
    setIsResendingConfirmation(true);

    try {
      await resendSignupConfirmation(confirmationEmail);
      setResendMessage('A new confirmation email has been sent.');
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see public holidays and your saved dates."
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email?.message}
            keyboardType="email-address"
            label="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Your e-mail"
            returnKeyType="next"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoComplete="current-password"
            error={errors.password?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={() => void submit()}
            placeholder="At least 8 characters"
            returnKeyType="done"
            rightAction={
              <PasswordToggle
                onPress={() => setPasswordVisible((current) => !current)}
                visible={passwordVisible}
              />
            }
            secureTextEntry={!passwordVisible}
            value={value}
          />
        )}
      />
      {requestError ? (
        <Text className="mb-4 text-sm leading-5 text-red-700">
          {requestError}
        </Text>
      ) : null}
      {confirmationEmail ? (
        <View className="mb-4 rounded-lg bg-blue-50 p-3">
          <Text className="mb-3 text-sm leading-5 text-blue-800">
            If the confirmation link expired, request a new email and try
            signing in again.
          </Text>
          {resendMessage ? (
            <Text className="mb-3 text-sm leading-5 text-blue-800">
              {resendMessage}
            </Text>
          ) : null}
          <AppButton
            disabled={resendCooldownSeconds > 0}
            isLoading={isResendingConfirmation}
            label={getResendConfirmationLabel(resendCooldownSeconds)}
            onPress={() => void resendConfirmation()}
            variant="secondary"
          />
        </View>
      ) : null}
      <AppButton
        isLoading={isSubmitting}
        label="Sign in"
        onPress={() => void submit()}
      />
      <View className="mt-7 flex-row items-center justify-center">
        <Text className="text-sm text-slate-600">New to DayBridge? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable
            accessibilityRole="link"
            className="min-h-11 justify-center"
          >
            <Text className="text-sm font-semibold text-blue-700">
              Create account
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthShell>
  );
}

function SignUpForm() {
  const router = useRouter();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<
    string | null
  >(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const {
    clearCooldown: clearResendCooldown,
    remainingSeconds: resendCooldownSeconds,
    startCooldown: startResendCooldown,
  } = useConfirmationCooldown();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    setRequestError(null);
    setSuccessMessage(null);
    setPendingConfirmationEmail(null);
    setResendMessage(null);
    clearResendCooldown();

    try {
      const result = await signUp(values);

      if (result.needsEmailConfirmation) {
        setPendingConfirmationEmail(values.email.trim());
        startResendCooldown();
        setSuccessMessage(
          'Account created. Check your inbox to confirm your email, then sign in.',
        );
      }
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    }
  });

  const resendConfirmation = async () => {
    if (!pendingConfirmationEmail) {
      return;
    }

    setRequestError(null);
    setResendMessage(null);
    startResendCooldown();
    setIsResendingConfirmation(true);

    try {
      await resendSignupConfirmation(pendingConfirmationEmail);
      setResendMessage('A new confirmation email has been sent.');
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error));
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save holidays to a private list tied to your account."
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to sign in"
        className="absolute right-6 top-8 h-11 w-11 items-center justify-center rounded-lg md:right-10 md:top-10"
        onPress={() => router.back()}
      >
        <ArrowLeft color="#334155" size={22} />
      </Pressable>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoCapitalize="words"
            autoComplete="name"
            error={errors.fullName?.message}
            label="Full name"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Your name"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email?.message}
            keyboardType="email-address"
            label="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Your e-mail"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoComplete="new-password"
            error={errors.password?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="At least 8 characters"
            rightAction={
              <PasswordToggle
                onPress={() => setPasswordVisible((current) => !current)}
                visible={passwordVisible}
              />
            }
            secureTextEntry={!passwordVisible}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            label="Confirm password"
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={() => void submit()}
            placeholder="Repeat your password"
            returnKeyType="done"
            rightAction={
              <PasswordToggle
                onPress={() => setConfirmPasswordVisible((current) => !current)}
                visible={confirmPasswordVisible}
              />
            }
            secureTextEntry={!confirmPasswordVisible}
            value={value}
          />
        )}
      />
      {requestError ? (
        <Text className="mb-4 text-sm leading-5 text-red-700">
          {requestError}
        </Text>
      ) : null}
      {successMessage ? (
        <View className="mb-4 rounded-lg bg-blue-50 p-3">
          <Text className="text-sm leading-5 text-blue-800">
            {successMessage}
          </Text>
          {resendMessage ? (
            <Text className="mt-3 text-sm leading-5 text-blue-800">
              {resendMessage}
            </Text>
          ) : null}
          {pendingConfirmationEmail ? (
            <View className="mt-3">
              <AppButton
                disabled={resendCooldownSeconds > 0}
                isLoading={isResendingConfirmation}
                label={getResendConfirmationLabel(resendCooldownSeconds)}
                onPress={() => void resendConfirmation()}
                variant="secondary"
              />
            </View>
          ) : null}
        </View>
      ) : null}
      <AppButton
        isLoading={isSubmitting}
        label="Create account"
        onPress={() => void submit()}
      />
      <Link href="/(auth)/sign-in" asChild>
        <Pressable
          accessibilityRole="link"
          className="mt-5 min-h-11 items-center justify-center"
        >
          <Text className="text-sm font-semibold text-blue-700">
            Back to sign in
          </Text>
        </Pressable>
      </Link>
    </AuthShell>
  );
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return mode === 'sign-in' ? <SignInForm /> : <SignUpForm />;
}
