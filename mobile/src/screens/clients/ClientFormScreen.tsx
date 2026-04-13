import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { FormField } from '@/components/forms/FormField';
import { useToast } from '@/components/ui/Toast';
import { useCreateClient } from '@/hooks/useClients';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'ClientForm'>;

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional().default(''),
  email: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

type ClientFormData = z.infer<typeof clientSchema>;

export function ClientFormScreen({ navigation }: Props) {
  const { show } = useToast();
  const createClient = useCreateClient();

  const { control, handleSubmit } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', companyName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', notes: '' },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      await createClient.mutateAsync(data as any);
      show('Client created');
      navigation.goBack();
    } catch {
      show('Failed to create client');
    }
  };

  return (
    <ScreenWrapper>
      <FormField control={control} name="name" label="Name *" autoCapitalize="words" />
      <FormField control={control} name="companyName" label="Company Name" autoCapitalize="words" />
      <FormField control={control} name="email" label="Email" keyboardType="email-address" />
      <FormField control={control} name="phone" label="Phone" keyboardType="phone-pad" />
      <FormField control={control} name="address" label="Address" />
      <View style={styles.row}>
        <View style={styles.flex2}><FormField control={control} name="city" label="City" /></View>
        <View style={styles.flex1}><FormField control={control} name="state" label="State" /></View>
      </View>
      <FormField control={control} name="zip" label="ZIP" keyboardType="numeric" />
      <FormField control={control} name="notes" label="Notes" multiline numberOfLines={3} />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={createClient.isPending} style={styles.button}>
        Save Client
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  button: { marginTop: 16, marginBottom: 24 },
});
