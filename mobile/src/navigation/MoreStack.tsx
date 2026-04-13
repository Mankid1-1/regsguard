import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { MoreMenuScreen } from '@/screens/more/MoreMenuScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { PasswordChangeScreen } from '@/screens/settings/PasswordChangeScreen';
import { NotificationPrefsScreen } from '@/screens/settings/NotificationPrefsScreen';
import { BillingScreen } from '@/screens/billing/BillingScreen';
import { ClientListScreen } from '@/screens/clients/ClientListScreen';
import { ClientFormScreen } from '@/screens/clients/ClientFormScreen';
import { ProjectListScreen } from '@/screens/projects/ProjectListScreen';
import { ProjectFormScreen } from '@/screens/projects/ProjectFormScreen';
import { CECreditListScreen } from '@/screens/ceCredits/CECreditListScreen';
import { CECreditFormScreen } from '@/screens/ceCredits/CECreditFormScreen';
import { ExpenseListScreen } from '@/screens/expenses/ExpenseListScreen';
import { ExpenseFormScreen } from '@/screens/expenses/ExpenseFormScreen';
import { TeamListScreen } from '@/screens/team/TeamListScreen';
import { ComplianceLogScreen } from '@/screens/compliance/ComplianceLogScreen';
import type { MoreStackParamList } from './types';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export function MoreStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Business Profile' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} options={{ title: 'Change Password' }} />
      <Stack.Screen name="NotificationPrefs" component={NotificationPrefsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Billing" component={BillingScreen} options={{ title: 'Billing' }} />
      <Stack.Screen name="ClientList" component={ClientListScreen} options={{ title: 'Clients' }} />
      <Stack.Screen name="ClientForm" component={ClientFormScreen} options={{ title: 'Client' }} />
      <Stack.Screen name="ProjectList" component={ProjectListScreen} options={{ title: 'Projects' }} />
      <Stack.Screen name="ProjectForm" component={ProjectFormScreen} options={{ title: 'Project' }} />
      <Stack.Screen name="CECreditList" component={CECreditListScreen} options={{ title: 'CE Credits' }} />
      <Stack.Screen name="CECreditForm" component={CECreditFormScreen} options={{ title: 'CE Credit' }} />
      <Stack.Screen name="ExpenseList" component={ExpenseListScreen} options={{ title: 'Expenses' }} />
      <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} options={{ title: 'Expense' }} />
      <Stack.Screen name="TeamList" component={TeamListScreen} options={{ title: 'Team' }} />
      <Stack.Screen name="ComplianceLog" component={ComplianceLogScreen} options={{ title: 'Compliance Log' }} />
    </Stack.Navigator>
  );
}
