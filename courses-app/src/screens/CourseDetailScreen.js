import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCourseById } from '../data/courses';
import { theme } from '../theme';

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const course = getCourseById(courseId);

  if (!course) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Curso no encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.cover, { backgroundColor: course.cover }]}>
          <Text style={styles.coverTitle}>{course.title}</Text>
          <Text style={styles.coverSubtitle}>por {course.instructor}</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Nivel" value={course.level} />
          <Stat label="Duración" value={`${course.durationHours} h`} />
          <Stat label="Rating" value={`★ ${course.rating}`} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre este curso</Text>
          <Text style={styles.summary}>{course.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Lecciones ({course.lessons.length})
          </Text>
          {course.lessons.map((lesson, idx) => (
            <Pressable
              key={lesson.id}
              onPress={() =>
                navigation.navigate('Lesson', {
                  courseId: course.id,
                  lessonId: lesson.id,
                })
              }
              style={({ pressed }) => [
                styles.lesson,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.lessonIndex}>
                <Text style={styles.lessonIndexText}>{idx + 1}</Text>
              </View>
              <View style={styles.lessonBody}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonMeta}>{lesson.durationMin} min</Text>
              </View>
              <Text style={styles.lessonChevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <View>
          <Text style={styles.priceLabel}>Precio</Text>
          <Text style={styles.price}>${course.price}</Text>
        </View>
        <Pressable
          onPress={() =>
            navigation.navigate('Lesson', {
              courseId: course.id,
              lessonId: course.lessons[0].id,
            })
          }
          style={({ pressed }) => [
            styles.enrollBtn,
            pressed && { backgroundColor: theme.colors.primaryDark },
          ]}
        >
          <Text style={styles.enrollText}>Empezar curso</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    paddingBottom: theme.spacing.xl,
  },
  cover: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  coverTitle: {
    color: '#FFFFFF',
    fontSize: theme.font.title,
    fontWeight: '800',
    marginBottom: 6,
  },
  coverSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: theme.font.body,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: -theme.spacing.lg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.font.h2,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.font.h2,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  summary: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    lineHeight: 22,
  },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  lessonIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  lessonIndexText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  lessonBody: {
    flex: 1,
  },
  lessonTitle: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  lessonMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
  },
  lessonChevron: {
    color: theme.colors.textMuted,
    fontSize: 24,
    fontWeight: '300',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  priceLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
  },
  price: {
    color: theme.colors.text,
    fontSize: theme.font.h1,
    fontWeight: '800',
  },
  enrollBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  enrollText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: theme.font.body,
  },
  missing: {
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
