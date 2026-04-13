import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { Badge } from '@/components/ui/Badge';
import { getDeadlineColor, getDaysUntil, formatDate, formatRelative } from '@/shared/utils/dates';
import type { UserDeadline } from '@/shared/types';

interface DeadlineCardProps {
  deadline: UserDeadline;
  onPress?: () => void;
}

const statusVariant = {
  UPCOMING: 'success' as const,
  DUE_SOON: 'warning' as const,
  OVERDUE: 'danger' as const,
  COMPLETED: 'default' as const,
  SKIPPED: 'outline' as const,
};

const borderColorMap = {
  red: '#ef4444',
  yellow: '#eab308',
  green: '#22c55e',
};

export function DeadlineCard({ deadline, onPress }: DeadlineCardProps) {
  const theme = useTheme();
  const dueDate = new Date(deadline.nextDueDate);
  const color = getDeadlineColor(dueDate);
  const daysLeft = getDaysUntil(dueDate);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant, borderLeftColor: borderColorMap[color] },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {deadline.regulation.title}
        </Text>
        <Badge label={deadline.status} variant={statusVariant[deadline.status]} />
      </View>

      <Text style={[styles.authority, { color: theme.colors.onSurfaceVariant }]}>
        {deadline.regulation.authority}
      </Text>

      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
          {deadline.regulation.trade} - {deadline.regulation.state}
        </Text>
        {deadline.regulation.fee && (
          <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
            Fee: {deadline.regulation.fee}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={[styles.dueDate, { color: borderColorMap[color] }]}>
            {formatDate(dueDate)}
          </Text>
          <Text style={[styles.relative, { color: theme.colors.onSurfaceVariant }]}>
            {formatRelative(dueDate)}
          </Text>
        </View>
        {deadline.regulation.portalUrl && (
          <Button
            mode="outlined"
            compact
            onPress={() => Linking.openURL(deadline.regulation.portalUrl!)}
          >
            View Portal
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  authority: {
    fontSize: 12,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  relative: {
    fontSize: 12,
  },
});
