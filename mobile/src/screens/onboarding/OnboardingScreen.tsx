import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Checkbox, Card, Chip, Searchbar, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { FormField } from '@/components/forms/FormField';
import { Loading } from '@/components/ui/Loading';
import { useToast } from '@/components/ui/Toast';
import { useRegulations, useSaveRegulations } from '@/hooks/useRegulations';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { profileApi } from '@/api/endpoints/profile';
import { businessProfileSchema, type BusinessProfileInput } from '@/shared/validators/profile';
import { TRADES, STATES } from '@/shared/utils/constants';
import type { Regulation } from '@/shared/types';

export function OnboardingScreen() {
  const theme = useTheme();
  const { show } = useToast();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [step, setStep] = useState(1);
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedRegulations, setSelectedRegulations] = useState<string[]>([]);

  const tradesParam = selectedTrades.join(',');
  const statesParam = selectedStates.join(',');

  const { data: regulations, isLoading: loadingRegs } = useRegulations(
    step === 3 ? { trades: tradesParam, states: statesParam } : undefined
  );

  const saveRegulations = useSaveRegulations();

  const { control, handleSubmit } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: '', address: '', city: '', state: '', zip: '',
      phone: '', email: '', responsiblePerson: '',
      insuranceProvider: '', insurancePolicyNumber: '', insuranceExpiration: '',
      bondAmount: '', bondProvider: '', bondExpiration: '',
    },
  });

  const toggleTrade = (value: string) => {
    setSelectedTrades((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const toggleState = (value: string) => {
    setSelectedStates((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const toggleRegulation = (id: string) => {
    setSelectedRegulations((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAllRegs = () => {
    if (regulations) {
      setSelectedRegulations(regulations.map((r) => r.id));
    }
  };

  const deselectAllRegs = () => setSelectedRegulations([]);

  const canProceed = () => {
    if (step === 1) return selectedTrades.length > 0;
    if (step === 2) return selectedStates.length > 0;
    if (step === 3) return selectedRegulations.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async (profileData: BusinessProfileInput) => {
    try {
      await profileApi.update(profileData);
      await saveRegulations.mutateAsync(selectedRegulations);
      await updateUser({ onboardingComplete: true });
      show('Setup complete!');
    } catch {
      show('Failed to complete setup');
    }
  };

  return (
    <ScreenWrapper scroll={false}>
      <View style={styles.container}>
        {/* Step Indicator */}
        <View style={styles.stepRow}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  s <= step
                    ? { backgroundColor: theme.colors.primary }
                    : { backgroundColor: theme.colors.outlineVariant },
                ]}
              >
                <Text style={[styles.stepNumber, { color: s <= step ? '#fff' : theme.colors.onSurfaceVariant }]}>
                  {s < step ? '\u2713' : s}
                </Text>
              </View>
              <Text style={[styles.stepLabel, { color: s === step ? theme.colors.primary : theme.colors.onSurfaceVariant }]}>
                {s === 1 ? 'Trades' : s === 2 ? 'States' : s === 3 ? 'Regulations' : 'Profile'}
              </Text>
            </View>
          ))}
        </View>

        {/* Step Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View>
              <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Select your trades</Text>
              <Text style={[styles.subheading, { color: theme.colors.onSurfaceVariant }]}>
                Choose the trades you work in
              </Text>
              <View style={styles.chipGrid}>
                {TRADES.map((trade) => (
                  <Chip
                    key={trade.value}
                    selected={selectedTrades.includes(trade.value)}
                    onPress={() => toggleTrade(trade.value)}
                    showSelectedCheck
                    style={[
                      styles.chip,
                      selectedTrades.includes(trade.value) && { borderColor: theme.colors.primary },
                    ]}
                  >
                    {trade.label}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Select your states</Text>
              <Text style={[styles.subheading, { color: theme.colors.onSurfaceVariant }]}>
                Where do you operate?
              </Text>
              <View style={styles.chipGrid}>
                {STATES.map((state) => (
                  <Chip
                    key={state.value}
                    selected={selectedStates.includes(state.value)}
                    onPress={() => toggleState(state.value)}
                    showSelectedCheck
                    style={[
                      styles.chip,
                      selectedStates.includes(state.value) && { borderColor: theme.colors.primary },
                    ]}
                  >
                    {state.label}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Confirm regulations</Text>
              <View style={styles.regHeader}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  {selectedRegulations.length} of {regulations?.length ?? 0} selected
                </Text>
                <Button
                  mode="text"
                  compact
                  onPress={selectedRegulations.length === regulations?.length ? deselectAllRegs : selectAllRegs}
                >
                  {selectedRegulations.length === regulations?.length ? 'Deselect All' : 'Select All'}
                </Button>
              </View>
              {loadingRegs ? (
                <Loading fullScreen={false} />
              ) : (
                regulations?.map((reg) => (
                  <TouchableOpacity
                    key={reg.id}
                    onPress={() => toggleRegulation(reg.id)}
                    style={[
                      styles.regCard,
                      {
                        borderColor: selectedRegulations.includes(reg.id) ? theme.colors.primary : theme.colors.outlineVariant,
                        backgroundColor: selectedRegulations.includes(reg.id) ? theme.colors.primaryContainer + '30' : theme.colors.surface,
                      },
                    ]}
                  >
                    <View style={styles.regRow}>
                      <Checkbox.Android
                        status={selectedRegulations.includes(reg.id) ? 'checked' : 'unchecked'}
                        onPress={() => toggleRegulation(reg.id)}
                        color={theme.colors.primary}
                      />
                      <View style={styles.regInfo}>
                        <Text style={[styles.regTitle, { color: theme.colors.onSurface }]}>{reg.title}</Text>
                        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }} numberOfLines={2}>
                          {reg.description}
                        </Text>
                        <View style={styles.regChips}>
                          <Chip compact textStyle={{ fontSize: 10 }}>{reg.trade}</Chip>
                          <Chip compact textStyle={{ fontSize: 10 }}>{reg.state}</Chip>
                          <Chip compact textStyle={{ fontSize: 10 }}>{reg.category}</Chip>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Business Profile</Text>
              <Text style={[styles.subheading, { color: theme.colors.onSurfaceVariant }]}>
                This info will be used to pre-fill your compliance documents
              </Text>

              <FormField control={control} name="businessName" label="Business Name *" />
              <FormField control={control} name="responsiblePerson" label="Responsible Person *" />
              <FormField control={control} name="address" label="Address *" />
              <View style={styles.row}>
                <View style={styles.flex2}>
                  <FormField control={control} name="city" label="City *" />
                </View>
                <View style={styles.flex1}>
                  <FormField control={control} name="state" label="State *" autoCapitalize="characters" />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <FormField control={control} name="zip" label="ZIP *" keyboardType="numeric" />
                </View>
                <View style={styles.flex1}>
                  <FormField control={control} name="phone" label="Phone *" keyboardType="phone-pad" />
                </View>
              </View>
              <FormField control={control} name="email" label="Business Email *" keyboardType="email-address" />

              <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                Insurance & Bonding (Optional)
              </Text>
              <FormField control={control} name="insuranceProvider" label="Insurance Provider" />
              <FormField control={control} name="insurancePolicyNumber" label="Policy Number" />
              <FormField control={control} name="insuranceExpiration" label="Insurance Expiration" placeholder="YYYY-MM-DD" />
              <FormField control={control} name="bondProvider" label="Bond Provider" />
              <FormField control={control} name="bondAmount" label="Bond Amount" keyboardType="numeric" />
              <FormField control={control} name="bondExpiration" label="Bond Expiration" placeholder="YYYY-MM-DD" />
            </View>
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant }]}>
          <Button
            mode="outlined"
            onPress={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < 4 ? (
            <Button
              mode="contained"
              onPress={handleNext}
              disabled={!canProceed()}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit(handleComplete)}
              loading={saveRegulations.isPending}
              disabled={saveRegulations.isPending}
            >
              Complete Setup
            </Button>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stepRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepNumber: { fontSize: 14, fontWeight: '600' },
  stepLabel: { fontSize: 11, marginTop: 4 },
  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subheading: { fontSize: 14, marginBottom: 20 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 4 },
  regHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  regCard: { borderWidth: 1, borderRadius: 8, marginBottom: 8, padding: 4 },
  regRow: { flexDirection: 'row', alignItems: 'flex-start' },
  regInfo: { flex: 1, paddingRight: 8 },
  regTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  regChips: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1 },
});
