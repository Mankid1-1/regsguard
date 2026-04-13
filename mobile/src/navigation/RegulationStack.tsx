import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { RegulationListScreen } from '@/screens/regulations/RegulationListScreen';
import { RegulationDetailScreen } from '@/screens/regulations/RegulationDetailScreen';
import type { RegulationStackParamList } from './types';

const Stack = createNativeStackNavigator<RegulationStackParamList>();

export function RegulationStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="RegulationList" component={RegulationListScreen} options={{ title: 'Regulations' }} />
      <Stack.Screen name="RegulationDetail" component={RegulationDetailScreen} options={{ title: 'Regulation' }} />
    </Stack.Navigator>
  );
}
