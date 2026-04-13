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
import { useCreateProject } from '@/hooks/useProjects';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'ProjectForm'>;

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional().default(''),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  permitNumber: z.string().optional().default(''),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function ProjectFormScreen({ navigation }: Props) {
  const { show } = useToast();
  const createProject = useCreateProject();

  const { control, handleSubmit } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '', description: '', address: '', city: '', state: '', zip: '', permitNumber: '' },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await createProject.mutateAsync(data);
      show('Project created');
      navigation.goBack();
    } catch {
      show('Failed to create project');
    }
  };

  return (
    <ScreenWrapper>
      <FormField control={control} name="name" label="Project Name *" />
      <FormField control={control} name="description" label="Description" multiline numberOfLines={3} />
      <FormField control={control} name="address" label="Address" />
      <FormField control={control} name="city" label="City" />
      <FormField control={control} name="state" label="State" autoCapitalize="characters" />
      <FormField control={control} name="zip" label="ZIP" keyboardType="numeric" />
      <FormField control={control} name="permitNumber" label="Permit Number" />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={createProject.isPending} style={styles.button}>
        Save Project
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({ button: { marginTop: 16, marginBottom: 24 } });
