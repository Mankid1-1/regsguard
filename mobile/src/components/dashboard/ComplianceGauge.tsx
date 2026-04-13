import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, ProgressBar, useTheme } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import type { ComplianceScore } from '@/shared/types';

interface ComplianceGaugeProps {
  score: ComplianceScore;
}

const gradeColors: Record<string, string> = {
  A: '#16a34a',
  B: '#22c55e',
  C: '#eab308',
  D: '#f97316',
  F: '#ef4444',
};

export function ComplianceGauge({ score }: ComplianceGaugeProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score.score / 100) * circumference;
  const color = gradeColors[score.grade] || gradeColors.F;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Compliance Score</Text>

      <View style={styles.gaugeContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.outlineVariant}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.gaugeCenter}>
          <Text style={[styles.grade, { color }]}>{score.grade}</Text>
          <Text style={[styles.scoreText, { color: theme.colors.onSurfaceVariant }]}>{score.score}/100</Text>
        </View>
      </View>

      <Button
        mode="text"
        compact
        onPress={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide Breakdown' : 'Show Breakdown'}
      </Button>

      {expanded && (
        <View style={styles.breakdown}>
          <BreakdownItem
            label="Deadlines"
            score={score.breakdown.deadlines.score}
            max={score.breakdown.deadlines.max}
            theme={theme}
          />
          <BreakdownItem
            label="CE Credits"
            score={score.breakdown.ceCredits.score}
            max={score.breakdown.ceCredits.max}
            theme={theme}
          />
          <BreakdownItem
            label="Insurance & Bond"
            score={score.breakdown.insurance.score}
            max={score.breakdown.insurance.max}
            theme={theme}
          />
          <BreakdownItem
            label="Recent Filings"
            score={score.breakdown.filings.score}
            max={score.breakdown.filings.max}
            theme={theme}
          />
        </View>
      )}
    </View>
  );
}

function BreakdownItem({ label, score, max, theme }: { label: string; score: number; max: number; theme: any }) {
  const pct = max > 0 ? score / max : 0;
  const barColor = pct > 0.8 ? '#16a34a' : pct > 0.5 ? '#eab308' : '#ef4444';

  return (
    <View style={styles.breakdownItem}>
      <View style={styles.breakdownHeader}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 13 }}>{label}</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{score}/{max}</Text>
      </View>
      <ProgressBar progress={pct} color={barColor} style={styles.progressBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  grade: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 12,
  },
  breakdown: {
    width: '100%',
    marginTop: 8,
  },
  breakdownItem: {
    marginBottom: 8,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
});
