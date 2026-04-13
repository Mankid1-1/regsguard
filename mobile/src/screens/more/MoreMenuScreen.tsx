import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { PermissionGate } from '@/components/rbac/PermissionGate';
import { useLogout } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/shared/rbac';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreMenu'>;

interface MenuItem {
  icon: string;
  label: string;
  screen: keyof MoreStackParamList;
  permission?: string;
}

const menuItems: MenuItem[] = [
  { icon: 'account-circle', label: 'Business Profile', screen: 'Profile' },
  { icon: 'account-group', label: 'Clients', screen: 'ClientList', permission: PERMISSIONS.VIEW_CLIENTS },
  { icon: 'briefcase', label: 'Projects', screen: 'ProjectList', permission: PERMISSIONS.VIEW_PROJECTS },
  { icon: 'school', label: 'CE Credits', screen: 'CECreditList' },
  { icon: 'cash', label: 'Expenses', screen: 'ExpenseList', permission: PERMISSIONS.VIEW_EXPENSES },
  { icon: 'account-multiple', label: 'Team', screen: 'TeamList', permission: PERMISSIONS.VIEW_TEAM },
  { icon: 'clipboard-text-clock', label: 'Compliance Log', screen: 'ComplianceLog' },
  { icon: 'credit-card', label: 'Billing', screen: 'Billing', permission: PERMISSIONS.MANAGE_BILLING },
  { icon: 'cog', label: 'Settings', screen: 'Settings' },
];

export function MoreMenuScreen({ navigation }: Props) {
  const theme = useTheme();
  const logoutMutation = useLogout();

  const renderItem = (item: MenuItem) => {
    const content = (
      <TouchableOpacity
        key={item.screen}
        style={[styles.menuItem, { borderBottomColor: theme.colors.outlineVariant }]}
        onPress={() => navigation.navigate(item.screen as any)}
      >
        <Icon name={item.icon} size={24} color={theme.colors.primary} />
        <Text style={[styles.menuLabel, { color: theme.colors.onSurface }]}>{item.label}</Text>
        <Icon name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
      </TouchableOpacity>
    );

    if (item.permission) {
      return (
        <PermissionGate key={item.screen} permission={item.permission}>
          {content}
        </PermissionGate>
      );
    }
    return content;
  };

  return (
    <ScreenWrapper>
      {menuItems.map(renderItem)}

      <TouchableOpacity
        style={[styles.menuItem, styles.logoutItem]}
        onPress={() => logoutMutation.mutate()}
      >
        <Icon name="logout" size={24} color={theme.colors.error} />
        <Text style={[styles.menuLabel, { color: theme.colors.error }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
  },
  logoutItem: {
    marginTop: 24,
    borderBottomWidth: 0,
  },
});
