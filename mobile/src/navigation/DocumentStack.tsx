import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { DocumentListScreen } from '@/screens/documents/DocumentListScreen';
import { NewDocumentScreen } from '@/screens/documents/NewDocumentScreen';
import { DocumentDetailScreen } from '@/screens/documents/DocumentDetailScreen';
import type { DocumentStackParamList } from './types';

const Stack = createNativeStackNavigator<DocumentStackParamList>();

export function DocumentStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="DocumentList" component={DocumentListScreen} options={{ title: 'Documents' }} />
      <Stack.Screen name="NewDocument" component={NewDocumentScreen} options={{ title: 'New Document' }} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: 'Document' }} />
    </Stack.Navigator>
  );
}
