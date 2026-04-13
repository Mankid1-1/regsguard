import React from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Loading } from '@/components/ui/Loading';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DeadlineList } from '@/components/dashboard/DeadlineList';
import { ComplianceGauge } from '@/components/dashboard/ComplianceGauge';
import { CalendarStrip } from '@/components/dashboard/CalendarStrip';
import { FilingHistoryItem } from '@/components/dashboard/FilingHistoryItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useComplianceScore } from '@/hooks/useComplianceScore';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>;

export function DashboardScreen({ navigation }: Props) {
  const theme = useTheme();
  const userName = useAuthStore((s) => s.user?.name);
  const isOnline = useOfflineStore((s) => s.isOnline);

  const { data: deadlineData, isLoading: loadingDeadlines, refetch: refetchDeadlines } = useDeadlines({ days: 90 });
  const { data: scoreData, isLoading: loadingScore, refetch: refetchScore } = useComplianceScore();

  const deadlines = deadlineData?.deadlines ?? [];
  const upcoming = deadlines.filter((d) => d.status === 'UPCOMING').length;
  const dueSoon = deadlines.filter((d) => d.status === 'DUE_SOON').length;
  const overdue = deadlines.filter((d) => d.status === 'OVERDUE').length;
  const completed = deadlines.filter((d) => d.status === 'COMPLETED').length;

  const isLoading = loadingDeadlines && loadingScore;

  const onRefresh = () => {
    refetchDeadlines();
    refetchScore();
  };

  if (isLoading) return <Loading message="Loading dashboard..." />;

  return (
    <ScreenWrapper>
      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={{ color: theme.colors.error, fontSize: 12 }}>
            You're offline. Showing cached data.
          </Text>
        </View>
      )}

      <Text style={[styles.welcome, { color: theme.colors.onSurfaceVariant }]}>
        Welcome back, {userName || 'User'}
      </Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatsCard label="Upcoming" count={upcoming} icon="calendar-clock" color="#16a34a" bgColor="#dcfce7" />
        <StatsCard label="Due Soon" count={dueSoon} icon="alert-circle-outline" color="#ca8a04" bgColor="#fef9c3" />
      </View>
      <View style={styles.statsGrid}>
        <StatsCard label="Overdue" count={overdue} icon="alert-outline" color="#dc2626" bgColor="#fef2f2" />
        <StatsCard label="Completed" count={completed} icon="check-circle-outline" color="#6b7280" bgColor="#f3f4f6" />
      </View>

      {/* Compliance Score */}
      {scoreData && (
        <View style={styles.section}>
          <ComplianceGauge score={scoreData} />
        </View>
      )}

      {/* Calendar Strip */}
      <View style={styles.section}>
        <CalendarStrip deadlines={deadlines} />
      </View>

      {/* Deadline List */}
      <View style={styles.section}>
        <DeadlineList
          deadlines={deadlines}
          onDeadlinePress={(d) =>
            navigation.navigate('RegulationDetail', { regulationId: d.regulation.id })
          }
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 14,
    marginBottom: 16,
  },
  offlineBanner: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  section: {
    marginTop: 16,
  },
});
