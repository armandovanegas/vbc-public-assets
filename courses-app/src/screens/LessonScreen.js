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

export default function LessonScreen({ route, navigation }) {
  const { courseId, lessonId } = route.params;
  const course = getCourseById(courseId);
  const index = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = course?.lessons[index];

  if (!course || !lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>Lección no encontrada.</Text>
      </SafeAreaView>
    );
  }

  const prev = index > 0 ? course.lessons[index - 1] : null;
  const next =
    index < course.lessons.length - 1 ? course.lessons[index + 1] : null;

  const goTo = (id) =>
    navigation.setParams({ lessonId: id });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.player}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.playerText}>Vista previa de la lección</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>
            Lección {index + 1} de {course.lessons.length}
          </Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.duration}>{lesson.durationMin} min</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Resumen</Text>
          <Text style={styles.text}>
            En esta lección de{' '}
            <Text style={{ fontWeight: '700' }}>{course.title}</Text> aprenderás
            los conceptos clave de "{lesson.title}". Mira el video, completa los
            ejercicios y avanza a la siguiente lección cuando estés listo.
          </Text>

          <Text style={styles.sectionTitle}>Lo que verás</Text>
          {[
            'Conceptos clave explicados paso a paso',
            'Ejemplos prácticos en código',
            'Ejercicio guiado al final',
          ].map((item) => (
            <View key={item} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.nav}>
        <Pressable
          disabled={!prev}
          onPress={() => prev && goTo(prev.id)}
          style={[styles.navBtn, !prev && styles.navBtnDisabled]}
        >
          <Text style={[styles.navText, !prev && styles.navTextDisabled]}>
            ‹ Anterior
          </Text>
        </Pressable>
        <Pressable
          disabled={!next}
          onPress={() => next && goTo(next.id)}
          style={[
            styles.navBtn,
            styles.navBtnPrimary,
            !next && styles.navBtnDisabled,
          ]}
        >
          <Text style={[styles.navText, { color: '#FFFFFF' }]}>
            {next ? 'Siguiente ›' : 'Finalizar'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
  player: {
    height: 220,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 48,
    marginBottom: 6,
  },
  playerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: theme.font.small,
  },
  body: {
    padding: theme.spacing.md,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.h1,
    fontWeight: '800',
    marginBottom: 4,
  },
  duration: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.font.h2,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  bulletText: {
    color: theme.colors.text,
    fontSize: theme.font.body,
  },
  nav: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  navBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  navBtnPrimary: {
    backgroundColor: theme.colors.primary,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  navTextDisabled: {
    color: theme.colors.textMuted,
  },
  missing: {
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
