import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, AuthError, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Ensure WebBrowser sessions are closed correctly on web
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (displayName: string) => Promise<{ data: { user: User | null } | null; error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for persisted session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error.message);
          setSession(null);
        } else if (session) {
          setSession(session);
        } else {
          setSession(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        return { error };
      }
      return { error: null };
    } catch (err) {
      return { error: err as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }
      return { error: null };
    } catch (err) {
      return { error: err as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
      } else {
        // Use the native scheme for redirect to ensure mobile devices can reach it
        const redirectUrl = Linking.createURL('/');
        console.log('Expo Redirect URL:', redirectUrl);

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });
        
        if (error) throw error;
        if (!data?.url) throw new Error('No auth URL returned from Supabase');

        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
        if (res.type === 'success' && res.url) {
          // Parse the access token from the URL hash
          const parsedUrl = new URL(res.url.replace('#', '?'));
          const accessToken = parsedUrl.searchParams.get('access_token');
          const refreshToken = parsedUrl.searchParams.get('refresh_token');

          if (accessToken && refreshToken) {
             const { error: setSessionError } = await supabase.auth.setSession({
                 access_token: accessToken,
                 refresh_token: refreshToken
             });
             if (setSessionError) throw setSessionError;
          }
        }
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      // Fallback for long URLs or specific browser issues
      alert("Failed to connect to Google. Please ensure you have a stable internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      setSession(null);
      router.replace('/(auth)/login');
      return { error: null };
    } catch (err) {
      return { error: err as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (displayName: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      
      if (error) throw error;

      // Manually refresh session to reflect changes in UI
      const { data: { session: newSession } } = await supabase.auth.getSession();
      setSession(newSession);
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}