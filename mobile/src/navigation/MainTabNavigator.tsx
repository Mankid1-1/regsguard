import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DashboardStack } from './DashboardStack';
import { DocumentStack } from './DocumentStack';
import { RegulationStack } from './RegulationStack';
import { MoreStack } from './MoreStack';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="view-dashboard" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="file-document-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Regulations"
        component={RegulationStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="shield-check-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="dots-horizontal" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
