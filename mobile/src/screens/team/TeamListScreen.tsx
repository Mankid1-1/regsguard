import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, FAB, Button, TextInput, Dialog, Portal, useTheme } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useTeam, useAddTeamMember, useRemoveTeamMember } from '@/hooks/useTeam';
import type { MoreStackParamList } from '@/navigation/types';
import type { TeamMember, Role } from '@/shared/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'TeamList'>;

export function TeamListScreen({}: Props) {
  const theme = useTheme();
  const { show } = useToast();
  const { data: members, isLoading, refetch } = useTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('FIELD_WORKER');

  const handleAdd = async () => {
    try {
      await addMember.mutateAsync({ email, role });
      show('Team member added');
      setDialogVisible(false);
      setEmail('');
    } catch {
      show('Failed to add team member');
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove Member', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMember.mutate(id) },
    ]);
  };

  const renderItem = ({ item }: { item: TeamMember }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>{item.member.name || 'Unnamed'}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{item.member.email}</Text>
          </View>
          <Badge label={item.role} variant="default" />
        </View>
      </Card.Content>
      <Card.Actions>
        <Button compact textColor={theme.colors.error} onPress={() => handleRemove(item.id)}>Remove</Button>
      </Card.Actions>
    </Card>
  );

  if (isLoading) return <Loading />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        ListEmptyComponent={<EmptyState icon="account-multiple" title="No team members" />}
      />
      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]} color={theme.colors.onPrimary} onPress={() => setDialogVisible(true)} />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add Team Member</Dialog.Title>
          <Dialog.Content>
            <TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAdd} loading={addMember.isPending}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
