import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, FAB, Chip, Card, Button, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useDocuments, useDeleteDocument } from '@/hooks/useDocuments';
import { documentsApi } from '@/api/endpoints/documents';
import { formatDate } from '@/shared/utils/dates';
import type { DocumentStackParamList } from '@/navigation/types';
import type { Document, DocumentCategory } from '@/shared/types';

type Props = NativeStackScreenProps<DocumentStackParamList, 'DocumentList'>;

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'outline'> = {
  DRAFT: 'outline',
  GENERATED: 'default',
  SENT: 'success',
  PENDING_SIGNATURE: 'warning',
  SIGNED: 'success',
  FILED: 'success',
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'TAX', label: 'Tax' },
  { value: 'PERMIT', label: 'Permit' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'LIEN_WAIVER', label: 'Lien Waiver' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'OTHER', label: 'Other' },
];

export function DocumentListScreen({ navigation }: Props) {
  const theme = useTheme();
  const [category, setCategory] = useState<string>('ALL');
  const { data: documents, isLoading, refetch } = useDocuments(
    category === 'ALL' ? undefined : category as DocumentCategory
  );
  const deleteDoc = useDeleteDocument();

  const handleDelete = (id: string) => {
    Alert.alert('Delete Document', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDoc.mutate(id) },
    ]);
  };

  const renderItem = ({ item }: { item: Document }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Badge label={item.status} variant={statusVariant[item.status] || 'outline'} />
        </View>
        <View style={styles.cardMeta}>
          <Badge label={item.category} variant="outline" size="sm" />
          {item.client && (
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
              {item.client.companyName || item.client.name}
            </Text>
          )}
        </View>
        <Text style={[styles.cardDate, { color: theme.colors.onSurfaceVariant }]}>
          {formatDate(new Date(item.updatedAt))}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button compact onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}>
          View
        </Button>
        <Button compact textColor={theme.colors.error} onPress={() => handleDelete(item.id)}>
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  if (isLoading) return <Loading />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            <FlatList
              data={CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(c) => c.value}
              renderItem={({ item: cat }) => (
                <Chip
                  selected={category === cat.value}
                  onPress={() => setCategory(cat.value)}
                  style={styles.filterChip}
                  compact
                >
                  {cat.label}
                </Chip>
              )}
            />
          </View>
        }
        ListEmptyComponent={<EmptyState icon="file-document-outline" title="No documents" description="Create your first document" />}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('NewDocument')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  filterRow: { marginBottom: 12 },
  filterChip: { marginRight: 6 },
  card: { marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  cardMeta: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 },
  cardDate: { fontSize: 12 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
