import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Switch, Button, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useTranslation } from '@/hooks/useTranslation';
import { preferencesApi } from '@/api/endpoints/preferences';
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from '@/shared/i18n/translations';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { show } = useToast();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const darkMode = useUserStore((s) => s.darkMode);
  const locale = useUserStore((s) => s.locale);
  const setDarkMode = useUserStore((s) => s.setDarkMode);
  const setLocale = useUserStore((s) => s.setLocale);

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    await setDarkMode(newValue);
    try {
      await preferencesApi.update({ darkMode: newValue });
    } catch {
      // Local change saved, server sync failed silently
    }
  };

  const changeLocale = async (newLocale: Locale) => {
    await setLocale(newLocale);
    try {
      await preferencesApi.update({ locale: newLocale });
    } catch {
      // Local change saved
    }
  };

  return (
    <ScreenWrapper>
      {/* Account */}
      <Card style={styles.card}>
        <Card.Title title="Account" />
        <Card.Content>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Name</Text>
            <Text style={{ color: theme.colors.onSurface }}>{user?.name || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Email</Text>
            <Text style={{ color: theme.colors.onSurface }}>{user?.email || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Role</Text>
            <Text style={{ color: theme.colors.onSurface }}>{user?.role || '-'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Security */}
      <Card style={styles.card}>
        <Card.Title title={t('settings.security')} />
        <Card.Content>
          <Button mode="outlined" onPress={() => navigation.navigate('PasswordChange')} icon="lock">
            Change Password
          </Button>
        </Card.Content>
      </Card>

      {/* Notifications */}
      <Card style={styles.card}>
        <Card.Title title={t('settings.notifications')} />
        <Card.Content>
          <Button mode="outlined" onPress={() => navigation.navigate('NotificationPrefs')} icon="bell">
            Notification Preferences
          </Button>
        </Card.Content>
      </Card>

      {/* Appearance */}
      <Card style={styles.card}>
        <Card.Title title="Appearance" />
        <Card.Content>
          <View style={styles.switchRow}>
            <Text style={{ color: theme.colors.onSurface }}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} color={theme.colors.primary} />
          </View>
        </Card.Content>
      </Card>

      {/* Language */}
      <Card style={styles.card}>
        <Card.Title title={t('settings.language')} />
        <Card.Content>
          <View style={styles.langRow}>
            {SUPPORTED_LOCALES.map((loc) => (
              <Button
                key={loc}
                mode={locale === loc ? 'contained' : 'outlined'}
                onPress={() => changeLocale(loc)}
                compact
                style={styles.langBtn}
              >
                {LOCALE_LABELS[loc]}
              </Button>
            ))}
          </View>
        </Card.Content>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 14 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { flex: 1 },
});
