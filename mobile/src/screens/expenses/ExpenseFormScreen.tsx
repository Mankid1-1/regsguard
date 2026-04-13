import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, SegmentedButtons } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { FormField } from '@/components/forms/FormField';
import { useToast } from '@/components/ui/Toast';
import { useCreateExpense } from '@/hooks/useExpenses';
import type { MoreStackParamList } from '@/navigation/types';
import type { ExpenseCategory } from '@/shared/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'ExpenseForm'>;

const schema = z.object({
  amount: z.string().min(1, 'Amount required'),
  description: z.string().optional().default(''),
  vendor: z.string().optional().default(''),
  date: z.string().min(1, 'Date required'),
});

type FormData = z.infer<typeof schema>;

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'MATERIALS', label: 'Materials' },
  { value: 'LABOR', label: 'Labor' },
  { value: 'PERMITS', label: 'Permits' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'FUEL', label: 'Fuel' },
  { value: 'OTHER', label: 'Other' },
];

export function ExpenseFormScreen({ navigation }: Props) {
  const { show } = useToast();
  const createExpense = useCreateExpense();
  const [category, setCategory] = useState<ExpenseCategory>('MATERIALS');

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', description: '', vendor: '', date: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createExpense.mutateAsync({
        category,
        amount: parseFloat(data.amount),
        description: data.description || undefined,
        vendor: data.vendor || undefined,
        date: data.date,
      });
      show('Expense added');
      navigation.goBack();
    } catch {
      show('Failed to add expense');
    }
  };

  return (
    <ScreenWrapper>
      <SegmentedButtons
        value={category}
        onValueChange={(v) => setCategory(v as ExpenseCategory)}
        buttons={EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
        style={styles.segments}
      />

      <FormField control={control} name="amount" label="Amount *" keyboardType="numeric" placeholder="0.00" />
      <FormField control={control} name="vendor" label="Vendor" />
      <FormField control={control} name="description" label="Description" multiline numberOfLines={2} />
      <FormField control={control} name="date" label="Date *" placeholder="YYYY-MM-DD" />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={createExpense.isPending} style={styles.button}>
        Save Expense
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  segments: { marginBottom: 16 },
  button: { marginTop: 16, marginBottom: 24 },
});
