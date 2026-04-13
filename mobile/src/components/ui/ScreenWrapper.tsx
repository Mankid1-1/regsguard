import React from 'react';
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  safeArea?: boolean;
}

export function ScreenWrapper({ children, scroll = true, padded = true, safeArea = true }: ScreenWrapperProps) {
  const theme = useTheme();

  const content = (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, padded && styles.padded]}>
      {children}
    </View>
  );

  const wrapped = scroll ? (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  const withKeyboard = (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {wrapped}
    </KeyboardAvoidingView>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        {withKeyboard}
      </SafeAreaView>
    );
  }

  return withKeyboard;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  padded: { padding: 16 },
  scrollContent: { flexGrow: 1 },
});
