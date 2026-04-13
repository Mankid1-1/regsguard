import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { FormField } from '@/components/forms/FormField';
import { useSignup, useLogin } from '@/hooks/useAuth';
import { signupSchema, type SignupInput } from '@/shared/validators/auth';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const theme = useTheme();
  const signupMutation = useSignup();
  const loginMutation = useLogin();

  const { control, handleSubmit, getValues } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      await signupMutation.mutateAsync(data);
      // Auto-login after signup
      loginMutation.mutate({ email: data.email, password: data.password });
    } catch {
      // Error handled by mutation state
    }
  };

  const isPending = signupMutation.isPending || loginMutation.isPending;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.colors.primary }]}>RegsGuard</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Create your account
          </Text>
        </View>

        <View style={styles.form}>
          <FormField
            control={control}
            name="name"
            label="Full Name"
            autoCapitalize="words"
          />

          <FormField
            control={control}
            name="email"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            control={control}
            name="password"
            label="Password"
            secureTextEntry
          />

          <FormField
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            secureTextEntry
          />

          {signupMutation.error && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {(signupMutation.error as any)?.response?.data?.error || 'Signup failed'}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending}
            style={styles.button}
          >
            Sign Up
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.link}
          >
            Already have an account? Sign In
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    gap: 4,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  link: {
    marginTop: 8,
  },
});
