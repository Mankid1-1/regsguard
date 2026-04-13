import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useClients } from '@/hooks/useClients';
import type { MoreStackParamList } from '@/navigation/types';
import type { Client } from '@/shared/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'ClientList'>;

export function ClientListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { data: clients, isLoading, refetch } = useClients();

  const renderItem = ({ item }: { item: Client }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ClientForm', { clientId: item.id })}>
      <Card.Content>
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.name}</Text>
        {item.companyName && <Text style={{ color: theme.colors.onSurfaceVariant }}>{item.companyName}</Text>}
        {item.email && <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{item.email}</Text>}
        {item.phone && <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{item.phone}</Text>}
      </Card.Content>
    </Card>
  );

  if (isLoading) return <Loading />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={<EmptyState icon="account-group" title="No clients yet" description="Add your first client" />}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => navigation.navigate('ClientForm')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
