import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Text, Card, Button, Divider, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/api/client';
import { formatDate } from '@/shared/utils/dates';
import type { RegulationStackParamList } from '@/navigation/types';
import type { Regulation } from '@/shared/types';

type Props = NativeStackScreenProps<RegulationStackParamList, 'RegulationDetail'>;

export function RegulationDetailScreen({ route }: Props) {
  const theme = useTheme();
  const { regulationId } = route.params;

  const { data: regulation, isLoading } = useQuery({
    queryKey: ['regulation', regulationId],
    queryFn: async () => {
      const response = await apiClient.get<Regulation>(`/api/regulations/${regulationId}`);
      return response.data;
    },
  });

  if (isLoading) return <Loading />;
  if (!regulation) return <Loading message="Regulation not found" />;

  return (
    <ScreenWrapper>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>{regulation.title}</Text>
          <View style={styles.badges}>
            <Badge label={regulation.trade} variant="default" />
            <Badge label={regulation.state} variant="outline" />
            <Badge label={regulation.category.replace('_', ' ')} variant="outline" />
            <Badge label={regulation.renewalCycle} variant="outline" />
          </View>

          <Divider style={styles.divider} />

          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Authority</Text>
          <Text style={{ color: theme.colors.onSurface, marginBottom: 12 }}>{regulation.authority}</Text>

          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Description</Text>
          <Text style={{ color: theme.colors.onSurface, marginBottom: 12 }}>{regulation.description}</Text>

          {regulation.fee && (
            <>
              <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Fee</Text>
              <Text style={{ color: theme.colors.onSurface, marginBottom: 12 }}>{regulation.fee}</Text>
            </>
          )}

          {regulation.notes && (
            <>
              <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Notes</Text>
              <Text style={{ color: theme.colors.onSurface, marginBottom: 12 }}>{regulation.notes}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        {regulation.portalUrl && (
          <Button mode="contained" icon="open-in-new" onPress={() => Linking.openURL(regulation.portalUrl!)}>
            Open Portal
          </Button>
        )}
        {regulation.officialEmail && (
          <Button mode="outlined" icon="email" onPress={() => Linking.openURL(`mailto:${regulation.officialEmail}`)}>
            Email Authority
          </Button>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  divider: { marginVertical: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  actions: { gap: 8, marginBottom: 24 },
});
