import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Badge } from '@/components/ui/Badge';
import type { ComplianceLog } from '@/shared/types';

interface FilingHistoryItemProps {
  log: ComplianceLog;
}

const actionVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'outline'> = {
  PDF_GENERATED: 'default',
  EMAIL_SENT: 'success',
  DEADLINE_COMPLETED: 'success',
  DEADLINE_CREATED: 'outline',
  PROFILE_UPDATED: 'outline',
  REGULATION_ADDED: 'outline',
  DOCUMENT_CREATED: 'default',
  DOCUMENT_SENT: 'success',
  DOCUMENT_SIGNED: 'success',
  AUTO_FILED: 'success',
  CE_COMPLETED: 'success',
  FOLLOW_UP_SENT: 'default',
  BULK_GENERATED: 'default',
};

const actionLabel: Record<string, string> = {
  PDF_GENERATED: 'PDF Generated',
  EMAIL_SENT: 'Email Sent',
  DEADLINE_COMPLETED: 'Completed',
  DEADLINE_CREATED: 'Deadline Created',
  PROFILE_UPDATED: 'Profile Updated',
  REGULATION_ADDED: 'Regulation Added',
  DOCUMENT_CREATED: 'Document Created',
  DOCUMENT_SENT: 'Document Sent',
  DOCUMENT_SIGNED: 'Document Signed',
  AUTO_FILED: 'Auto-Filed',
  CE_COMPLETED: 'CE Completed',
  FOLLOW_UP_SENT: 'Follow-Up Sent',
  BULK_GENERATED: 'Bulk Generated',
};

export function FilingHistoryItem({ log }: FilingHistoryItemProps) {
  const theme = useTheme();
  const date = new Date(log.createdAt);

  return (
    <View style={[styles.item, { borderBottomColor: theme.colors.outlineVariant }]}>
      <Badge
        label={actionLabel[log.action] || log.action}
        variant={actionVariant[log.action] || 'outline'}
      />
      <View style={styles.content}>
        {log.regulation && (
          <Text style={[styles.regTitle, { color: theme.colors.onSurface }]}>
            {log.regulation.title}
          </Text>
        )}
        <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  content: {
    flex: 1,
  },
  regTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
});
