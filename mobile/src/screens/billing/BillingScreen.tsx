import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { billingApi } from '@/api/endpoints/billing';
import { formatDate } from '@/shared/utils/dates';

const MONTHLY_PRICE_ID = 'price_monthly';
const ANNUAL_PRICE_ID = 'price_annual';

export function BillingScreen() {
  const theme = useTheme();
  const { show } = useToast();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      try {
        const response = await billingApi.getSubscription();
        return response.data;
      } catch {
        return null;
      }
    },
  });

  const handleCheckout = async (priceId: string) => {
    try {
      const response = await billingApi.createCheckout(priceId);
      await Linking.openURL(response.data.url);
    } catch {
      show('Failed to open checkout');
    }
  };

  const handleManage = async () => {
    try {
      const response = await billingApi.getPortalUrl();
      await Linking.openURL(response.data.url);
    } catch {
      show('Failed to open billing portal');
    }
  };

  if (isLoading) return <Loading />;

  return (
    <ScreenWrapper>
      {subscription ? (
        <Card style={styles.card}>
          <Card.Title title="Your Subscription" />
          <Card.Content>
            <View style={styles.row}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Status</Text>
              <Badge
                label={subscription.status}
                variant={subscription.status === 'ACTIVE' ? 'success' : subscription.status === 'TRIALING' ? 'default' : 'warning'}
              />
            </View>
            {subscription.currentPeriodEnd && (
              <View style={styles.row}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Renews</Text>
                <Text style={{ color: theme.colors.onSurface }}>
                  {formatDate(new Date(subscription.currentPeriodEnd))}
                </Text>
              </View>
            )}
            <Button mode="outlined" onPress={handleManage} style={styles.manageBtn} icon="open-in-new">
              Manage Subscription
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <Text style={[styles.heading, { color: theme.colors.onSurface }]}>Choose a Plan</Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={[styles.planName, { color: theme.colors.onSurface }]}>Monthly</Text>
              <Text style={[styles.price, { color: theme.colors.primary }]}>$29/mo</Text>
              <Button mode="outlined" onPress={() => handleCheckout(MONTHLY_PRICE_ID)} style={styles.planBtn}>
                Subscribe Monthly
              </Button>
            </Card.Content>
          </Card>

          <Card style={[styles.card, { borderColor: theme.colors.primary, borderWidth: 2 }]}>
            <Card.Content>
              <Badge label="Save $58/year" variant="success" />
              <Text style={[styles.planName, { color: theme.colors.onSurface, marginTop: 8 }]}>Annual</Text>
              <Text style={[styles.price, { color: theme.colors.primary }]}>$290/yr</Text>
              <Button mode="contained" onPress={() => handleCheckout(ANNUAL_PRICE_ID)} style={styles.planBtn}>
                Subscribe Annually
              </Button>
            </Card.Content>
          </Card>
        </>
      )}

      <Card style={styles.card}>
        <Card.Title title="Included Features" />
        <Card.Content>
          {[
            'Smart deadline tracking & alerts',
            '16+ document templates with auto-fill',
            'PDF generation & e-signatures',
            'Team management with RBAC',
            'Compliance score & audit trail',
            'Email & push notifications',
          ].map((feature) => (
            <Text key={feature} style={[styles.feature, { color: theme.colors.onSurface }]}>
              {'\u2022'} {feature}
            </Text>
          ))}
        </Card.Content>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  planName: { fontSize: 18, fontWeight: '600' },
  price: { fontSize: 28, fontWeight: '700', marginVertical: 8 },
  planBtn: { marginTop: 8 },
  manageBtn: { marginTop: 12 },
  feature: { fontSize: 14, paddingVertical: 3 },
});
