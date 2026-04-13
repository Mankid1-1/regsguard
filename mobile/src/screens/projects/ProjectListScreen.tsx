import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useProjects } from '@/hooks/useProjects';
import { formatDate } from '@/shared/utils/dates';
import type { MoreStackParamList } from '@/navigation/types';
import type { Project } from '@/shared/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'ProjectList'>;

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'outline'> = {
  DRAFT: 'outline', ACTIVE: 'success', COMPLETED: 'default', ARCHIVED: 'outline',
};

export function ProjectListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { data: projects, isLoading, refetch } = useProjects();

  const renderItem = ({ item }: { item: Project }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ProjectForm', { projectId: item.id })}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>{item.name}</Text>
          <Badge label={item.status} variant={statusVariant[item.status]} size="sm" />
        </View>
        {item.client && <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{item.client.name}</Text>}
        {item.contractAmount && <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>${item.contractAmount.toLocaleString()}</Text>}
      </Card.Content>
    </Card>
  );

  if (isLoading) return <Loading />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={<EmptyState icon="briefcase" title="No projects yet" />}
      />
      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]} color={theme.colors.onPrimary} onPress={() => navigation.navigate('ProjectForm')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
