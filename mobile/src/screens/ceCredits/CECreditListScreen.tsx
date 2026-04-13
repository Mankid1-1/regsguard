import React from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, FAB, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCECredits, useDeleteCECredit } from '@/hooks/useCECredits';
import { formatDate } from '@/shared/utils/dates';
import type { MoreStackParamList } from '@/navigation/types';
import type { CECredit } from '@/shared/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'CECreditList'>;

export function CECreditListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { data: credits, isLoading, refetch } = useCECredits();
  const deleteCredit = useDeleteCECredit();

  const handleDelete = (id: string) => {
    Alert.alert('Delete CE Credit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCredit.mutate(id) },
    ]);
  };

  const renderItem = ({ item }: { item: CECredit }) => (
    <Card style={styles.card} onLongPress={() => handleDelete(item.id)}>
      <Card.Content>
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.courseName}</Text>
        {item.provider && <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{item.provider}</Text>}
        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{item.hours} hours</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>Completed: {formatDate(new Date(item.completedAt))}</Text>
      </Card.Content>
    </Card>
  );

  if (isLoading) return <Loading />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={credits}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={<EmptyState icon="school" title="No CE credits yet" />}
      />
      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]} color={theme.colors.onPrimary} onPress={() => navigation.navigate('CECreditForm')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 8 },
  name: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
