import React from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, FAB, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses';
import { formatDate } from '@/shared/utils/dates';
import type { MoreStackParamList } from '@/navigation/types';
import type { Expense } from '@/shared/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'ExpenseList'>;

export function ExpenseListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { data: expenses, isLoading, refetch } = useExpenses();
  const deleteExpense = useDeleteExpense();

  const handleDelete = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpense.mutate(id) },
    ]);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <Card style={styles.card} onLongPress={() => handleDelete(item.id)}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={[styles.amount, { color: theme.colors.onSurface }]}>${item.amount.toFixed(2)}</Text>
          <Badge label={item.category} variant="outline" size="sm" />
        </View>
        {item.description && <Text style={{ color: theme.colors.onSurfaceVariant }}>{item.description}</Text>}
        {item.vendor && <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>Vendor: {item.vendor}</Text>}
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{formatDate(new Date(item.date))}</Text>
      </Card.Content>
    </Card>
  );

  if (isLoading) return <Loading />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={<EmptyState icon="cash" title="No expenses yet" />}
      />
      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]} color={theme.colors.onPrimary} onPress={() => navigation.navigate('ExpenseForm')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  amount: { fontSize: 18, fontWeight: '700' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
