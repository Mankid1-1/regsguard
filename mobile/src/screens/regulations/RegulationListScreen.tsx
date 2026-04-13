import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useUserRegulations } from '@/hooks/useRegulations';
import { useDeadlines } from '@/hooks/useDeadlines';
import { getDaysUntil, formatDate, getDeadlineColor } from '@/shared/utils/dates';
import type { RegulationStackParamList } from '@/navigation/types';
import type { UserRegulation } from '@/shared/types';

type Props = NativeStackScreenProps<RegulationStackParamList, 'RegulationList'>;

export function RegulationListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { data: userRegs, isLoading: loadingRegs } = useUserRegulations();
  const { data: deadlineData } = useDeadlines({ days: 365 });

  const deadlineMap = new Map<string, { nextDueDate: string; status: string }>();
  deadlineData?.deadlines.forEach((d) => {
    deadlineMap.set(d.regulation.id, { nextDueDate: d.nextDueDate, status: d.status });
  });

  if (loadingRegs) return <Loading />;

  const renderItem = ({ item }: { item: UserRegulation }) => {
    const reg = item.regulation;
    const deadline = deadlineMap.get(reg.id);
    const dueDate = deadline ? new Date(deadline.nextDueDate) : null;
    const daysLeft = dueDate ? getDaysUntil(dueDate) : null;
    const color = dueDate ? getDeadlineColor(dueDate) : null;

    const statusColors = { red: '#ef4444', yellow: '#eab308', green: '#22c55e' };

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('RegulationDetail', { regulationId: reg.id })}
      >
        <Card.Content>
          <Text style={[styles.regTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {reg.title}
          </Text>
          <View style={styles.badges}>
            <Badge label={reg.trade} variant="default" size="sm" />
            <Badge label={reg.state} variant="outline" size="sm" />
            <Badge label={reg.category.replace('_', ' ')} variant="outline" size="sm" />
          </View>
          <Text style={[styles.authority, { color: theme.colors.onSurfaceVariant }]}>{reg.authority}</Text>
          {dueDate && (
            <View style={styles.dueRow}>
              <Text style={{ color: statusColors[color!], fontWeight: '600', fontSize: 13 }}>
                {formatDate(dueDate)}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                {daysLeft! > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft!)}d overdue`}
              </Text>
            </View>
          )}
          {reg.fee && (
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, marginTop: 4 }}>
              Fee: {reg.fee}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={userRegs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.grid}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="shield-check-outline" title="No regulations" description="Complete onboarding to add regulations" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  grid: { gap: 8 },
  card: { flex: 1, marginBottom: 8 },
  regTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  authority: { fontSize: 12, marginBottom: 6 },
  dueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
