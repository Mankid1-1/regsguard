import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, Card, Button, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Loading } from '@/components/ui/Loading';
import { useToast } from '@/components/ui/Toast';
import { notificationsApi } from '@/api/endpoints/notifications';
import { ALERT_THRESHOLDS } from '@/shared/utils/constants';

export function NotificationPrefsScreen() {
  const theme = useTheme();
  const { show } = useToast();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notification-prefs'],
    queryFn: async () => {
      const response = await notificationsApi.getPreferences();
      return response.data;
    },
  });

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefs) {
      setEmailEnabled(prefs.emailEnabled);
      setPushEnabled(prefs.pushEnabled);
      setInAppEnabled(prefs.inAppEnabled);
    }
  }, [prefs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationsApi.updatePreferences({ emailEnabled, pushEnabled, inAppEnabled });
      show('Preferences saved');
    } catch {
      show('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <ScreenWrapper>
      <Card style={styles.card}>
        <Card.Title title="Channels" />
        <Card.Content>
          <View style={styles.switchRow}>
            <Text style={{ color: theme.colors.onSurface }}>Email Notifications</Text>
            <Switch value={emailEnabled} onValueChange={setEmailEnabled} color={theme.colors.primary} />
          </View>
          <View style={styles.switchRow}>
            <Text style={{ color: theme.colors.onSurface }}>Push Notifications</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} color={theme.colors.primary} />
          </View>
          <View style={styles.switchRow}>
            <Text style={{ color: theme.colors.onSurface }}>In-App Notifications</Text>
            <Switch value={inAppEnabled} onValueChange={setInAppEnabled} color={theme.colors.primary} />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Alert Days" titleVariant="titleMedium" />
        <Card.Content>
          <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}>
            You'll be notified {ALERT_THRESHOLDS.join(', ')} days before deadlines
          </Text>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleSave} loading={saving} style={styles.button}>
        Save Preferences
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  button: { marginTop: 8, marginBottom: 24 },
});
