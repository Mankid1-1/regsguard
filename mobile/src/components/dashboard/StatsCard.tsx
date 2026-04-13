import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface StatsCardProps {
  label: string;
  count: number;
  icon: string;
  color: string;
  bgColor: string;
}

export function StatsCard({ label, count, icon, color, bgColor }: StatsCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.count, { color: theme.colors.onSurface }]}>{count}</Text>
      <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  count: {
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});
