import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, useTheme } from 'react-native-paper';
import { DeadlineCard } from './DeadlineCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { UserDeadline, DeadlineStatus } from '@/shared/types';

interface DeadlineListProps {
  deadlines: UserDeadline[];
  onDeadlinePress?: (deadline: UserDeadline) => void;
}

type FilterOption = 'ALL' | DeadlineStatus;

export function DeadlineList({ deadlines, onDeadlinePress }: DeadlineListProps) {
  const theme = useTheme();
  const [filter, setFilter] = useState<FilterOption>('ALL');

  const filtered = filter === 'ALL'
    ? deadlines
    : deadlines.filter((d) => d.status === filter);

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Deadlines</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>{filtered.length} items</Text>
      </View>

      <SegmentedButtons
        value={filter}
        onValueChange={(v) => setFilter(v as FilterOption)}
        style={styles.segments}
        buttons={[
          { value: 'ALL', label: 'All' },
          { value: 'DUE_SOON', label: 'Due Soon' },
          { value: 'OVERDUE', label: 'Overdue' },
          { value: 'UPCOMING', label: 'Upcoming' },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState icon="calendar-check" title="No deadlines" description="No deadlines match this filter" />
      ) : (
        filtered.map((d) => (
          <DeadlineCard key={d.id} deadline={d} onPress={() => onDeadlinePress?.(d)} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  segments: {
    marginBottom: 12,
  },
});
