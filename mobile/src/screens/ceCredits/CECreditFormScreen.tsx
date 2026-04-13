import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { FormField } from '@/components/forms/FormField';
import { useToast } from '@/components/ui/Toast';
import { useCreateCECredit } from '@/hooks/useCECredits';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'CECreditForm'>;

const schema = z.object({
  courseName: z.string().min(1, 'Course name is required'),
  provider: z.string().optional().default(''),
  hours: z.string().min(1, 'Hours required'),
  completedAt: z.string().min(1, 'Completion date required'),
  notes: z.string().optional().default(''),
});

type FormData = z.infer<typeof schema>;

export function CECreditFormScreen({ navigation }: Props) {
  const { show } = useToast();
  const createCredit = useCreateCECredit();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { courseName: '', provider: '', hours: '', completedAt: '', notes: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createCredit.mutateAsync({
        courseName: data.courseName,
        provider: data.provider || undefined,
        hours: parseFloat(data.hours),
        completedAt: data.completedAt,
        notes: data.notes || undefined,
      });
      show('CE credit added');
      navigation.goBack();
    } catch {
      show('Failed to add CE credit');
    }
  };

  return (
    <ScreenWrapper>
      <FormField control={control} name="courseName" label="Course Name *" />
      <FormField control={control} name="provider" label="Provider" />
      <FormField control={control} name="hours" label="Hours *" keyboardType="numeric" />
      <FormField control={control} name="completedAt" label="Completed Date *" placeholder="YYYY-MM-DD" />
      <FormField control={control} name="notes" label="Notes" multiline numberOfLines={3} />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={createCredit.isPending} style={styles.button}>
        Save CE Credit
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({ button: { marginTop: 16, marginBottom: 24 } });
