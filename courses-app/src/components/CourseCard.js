import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export default function CourseCard({ course, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.cover, { backgroundColor: course.cover }]}>
        <Text style={styles.coverEmoji}>
          {course.category === 'dev' ? '</>' : course.category === 'design' ? '✦' : course.category === 'business' ? '◆' : '★'}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.level}>{course.level.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.instructor} numberOfLines={1}>
          {course.instructor}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>★ {course.rating}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{course.durationHours}h</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.price}>${course.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  cover: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  body: {
    padding: theme.spacing.md,
  },
  level: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.h2,
    fontWeight: '700',
    marginBottom: 4,
  },
  instructor: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginBottom: theme.spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
  },
  metaDot: {
    color: theme.colors.textMuted,
    marginHorizontal: 6,
  },
  price: {
    color: theme.colors.text,
    fontSize: theme.font.small,
    fontWeight: '700',
  },
});
