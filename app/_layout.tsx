import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from '../src/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { TransactionProvider } from '../src/context/TransactionContext';
import { LoanProvider } from '../src/context/LoanContext';
import { useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { PreferencesProvider, usePreferences } from '../src/context/PreferencesContext';

function AppContent() {
  const { session, isLoading } = useAuth();
  const { theme } = usePreferences();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (session?.user) {
      if (inAuthGroup || (!inAuthGroup && !inAppGroup)) {
        router.replace('/(app)/home');
      }
    } else {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [session?.user?.id, isLoading, segments[0]]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <Slot />
    </PaperProvider>
  );
}

function RootLayout() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <TransactionProvider>
          <LoanProvider>
            <SafeAreaProvider>
              <AppContent />
            </SafeAreaProvider>
          </LoanProvider>
        </TransactionProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}

export default RootLayout;