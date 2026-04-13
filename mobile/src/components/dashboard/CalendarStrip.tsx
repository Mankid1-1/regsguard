import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { getDeadlineColor } from '@/shared/utils/dates';
import type { UserDeadline } from '@/shared/types';

interface CalendarStripProps {
  deadlines: UserDeadline[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarStrip({ deadlines }: CalendarStripProps) {
  const theme = useTheme();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Generate 30 days from today
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  const deadlinesByDate = new Map<string, UserDeadline[]>();
  deadlines.forEach((d) => {
    const key = d.nextDueDate.split('T')[0];
    const existing = deadlinesByDate.get(key) || [];
    existing.push(d);
    deadlinesByDate.set(key, existing);
  });

  const selectedDeadlines = selectedDate ? deadlinesByDate.get(selectedDate) || [] : [];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Calendar</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((date) => {
          const dateKey = date.toISOString().split('T')[0];
          const hasDeadlines = deadlinesByDate.has(dateKey);
          const isToday = dateKey === today.toISOString().split('T')[0];
          const isSelected = dateKey === selectedDate;

          let dotColor: string | undefined;
          if (hasDeadlines) {
            const color = getDeadlineColor(date);
            dotColor = color === 'red' ? '#ef4444' : color === 'yellow' ? '#eab308' : '#22c55e';
          }

          return (
            <TouchableOpacity
              key={dateKey}
              onPress={() => setSelectedDate(isSelected ? null : dateKey)}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: theme.colors.primaryContainer },
                isToday && !isSelected && { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Text style={[styles.dayName, { color: theme.colors.onSurfaceVariant }]}>
                {DAYS[date.getDay()]}
              </Text>
              <Text style={[styles.dayNumber, { color: isToday ? theme.colors.primary : theme.colors.onSurface }]}>
                {date.getDate()}
              </Text>
              {dotColor && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedDeadlines.length > 0 && (
        <View style={[styles.selectedList, { borderTopColor: theme.colors.outlineVariant }]}>
          {selectedDeadlines.map((d) => (
            <Text key={d.id} style={[styles.selectedItem, { color: theme.colors.onSurface }]}>
              {d.regulation.title} - {d.regulation.authority}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dayCell: {
    width: 48,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 4,
  },
  dayName: {
    fontSize: 10,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  selectedList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  selectedItem: {
    fontSize: 13,
    paddingVertical: 4,
  },
});
