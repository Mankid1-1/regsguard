import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { FormField } from '@/components/forms/FormField';
import { Loading } from '@/components/ui/Loading';
import { useToast } from '@/components/ui/Toast';
import { profileApi } from '@/api/endpoints/profile';
import { businessProfileSchema, type BusinessProfileInput } from '@/shared/validators/profile';

export function ProfileScreen() {
  const theme = useTheme();
  const { show } = useToast();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileApi.get();
      return response.data;
    },
  });

  const { control, handleSubmit, reset } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: '', address: '', city: '', state: '', zip: '',
      phone: '', email: '', responsiblePerson: '',
      insuranceProvider: '', insurancePolicyNumber: '', insuranceExpiration: '',
      bondAmount: '', bondProvider: '', bondExpiration: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        businessName: profile.businessName || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip: profile.zip || '',
        phone: profile.phone || '',
        email: profile.email || '',
        responsiblePerson: profile.responsiblePerson || '',
        insuranceProvider: profile.insuranceProvider || '',
        insurancePolicyNumber: profile.insurancePolicyNumber || '',
        insuranceExpiration: profile.insuranceExpiration?.split('T')[0] || '',
        bondAmount: profile.bondAmount || '',
        bondProvider: profile.bondProvider || '',
        bondExpiration: profile.bondExpiration?.split('T')[0] || '',
      });
    }
  }, [profile, reset]);

  const [saving, setSaving] = React.useState(false);

  const onSubmit = async (data: BusinessProfileInput) => {
    setSaving(true);
    try {
      await profileApi.update(data);
      show('Profile saved');
    } catch {
      show('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <ScreenWrapper>
      <Card style={styles.card}>
        <Card.Title title="Business Information" />
        <Card.Content>
          <FormField control={control} name="businessName" label="Business Name *" />
          <FormField control={control} name="responsiblePerson" label="Responsible Person *" />
          <FormField control={control} name="address" label="Address *" />
          <View style={styles.row}>
            <View style={styles.flex2}><FormField control={control} name="city" label="City *" /></View>
            <View style={styles.flex1}><FormField control={control} name="state" label="State *" autoCapitalize="characters" /></View>
          </View>
          <View style={styles.row}>
            <View style={styles.flex1}><FormField control={control} name="zip" label="ZIP *" keyboardType="numeric" /></View>
            <View style={styles.flex1}><FormField control={control} name="phone" label="Phone *" keyboardType="phone-pad" /></View>
          </View>
          <FormField control={control} name="email" label="Business Email *" keyboardType="email-address" />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Insurance & Bonding" />
        <Card.Content>
          <View style={styles.row}>
            <View style={styles.flex1}><FormField control={control} name="insuranceProvider" label="Insurance Provider" /></View>
            <View style={styles.flex1}><FormField control={control} name="insurancePolicyNumber" label="Policy Number" /></View>
          </View>
          <FormField control={control} name="insuranceExpiration" label="Insurance Expiration" placeholder="YYYY-MM-DD" />
          <View style={styles.row}>
            <View style={styles.flex1}><FormField control={control} name="bondProvider" label="Bond Provider" /></View>
            <View style={styles.flex1}><FormField control={control} name="bondAmount" label="Bond Amount" keyboardType="numeric" /></View>
          </View>
          <FormField control={control} name="bondExpiration" label="Bond Expiration" placeholder="YYYY-MM-DD" />
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={saving} style={styles.button}>
        Save Profile
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  button: { marginTop: 8, marginBottom: 24 },
});
