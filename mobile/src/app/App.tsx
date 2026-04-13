import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/utils/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { lightTheme, darkTheme } from '@/theme';
import { ToastProvider } from '@/components/ui/Toast';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  const darkMode = useUserStore((s) => s.darkMode);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateUser = useUserStore((s) => s.hydrate);
  const hydrateOffline = useOfflineStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const loadPermissions = useUserStore((s) => s.loadPermissions);

  useEffect(() => {
    hydrateAuth();
    hydrateUser();
    hydrateOffline();
  }, [hydrateAuth, hydrateUser, hydrateOffline]);

  useEffect(() => {
    if (user?.role) {
      loadPermissions(user.role);
    }
  }, [user?.role, loadPermissions]);

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <StatusBar
              barStyle={darkMode ? 'light-content' : 'dark-content'}
              backgroundColor={theme.colors.surface}
            />
            <RootNavigator />
          </ToastProvider>
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
