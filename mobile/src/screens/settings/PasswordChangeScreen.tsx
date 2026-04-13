import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { FormField } from '@/components/forms/FormField';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/api/client';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'PasswordChange'>;

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Need 1 uppercase').regex(/[0-9]/, 'Need 1 number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export function PasswordChangeScreen({ navigation }: Props) {
  const { show } = useToast();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await apiClient.patch('/api/user/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      show('Password updated');
      navigation.goBack();
    } catch {
      show('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <FormField control={control} name="currentPassword" label="Current Password" secureTextEntry />
      <FormField control={control} name="newPassword" label="New Password" secureTextEntry />
      <FormField control={control} name="confirmPassword" label="Confirm New Password" secureTextEntry />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={saving} style={styles.button}>
        Update Password
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({ button: { marginTop: 16, marginBottom: 24 } });
