import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';
import { UserFacingError } from '@/utils/errors';

type SessionContextValue = {
  session: Session | null;
  isConfigured: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(supabase !== null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      setSession(error ? null : data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isConfigured: supabase !== null,
      isLoading,
      signOut: async () => {
        if (!supabase) {
          throw new UserFacingError('Supabase is not configured.');
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
          throw new UserFacingError(
            'You could not be signed out. Please try again.',
          );
        }
      },
    }),
    [isLoading, session],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used inside SessionProvider.');
  }

  return context;
}
