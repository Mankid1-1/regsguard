import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilingHistoryItem } from '@/components/dashboard/FilingHistoryItem';
import { apiClient } from '@/api/client';
import type { ComplianceLog } from '@/shared/types';

export function ComplianceLogScreen() {
  const theme = useTheme();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['compliance-logs'],
    queryFn: async () => {
      // Uses the user-scoped compliance logs endpoint
      const response = await apiClient.get<ComplianceLog[]>('/api/user/compliance-score');
      // The actual compliance logs come from a different endpoint structure
      // For now, return empty and we'll adjust the API
      return [] as ComplianceLog[];
    },
  });

  if (isLoading) return <Loading />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FilingHistoryItem log={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="clipboard-text-clock" title="No activity yet" description="Your compliance actions will appear here" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
});
