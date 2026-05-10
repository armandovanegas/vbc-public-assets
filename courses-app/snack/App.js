// Cursos — versión single-file lista para Expo Snack
// Pega este archivo completo en https://snack.expo.dev como App.js
// Dependencias requeridas (Snack debería instalarlas automáticamente):
//   @react-navigation/native
//   @react-navigation/native-stack
//   react-native-safe-area-context
//   react-native-screens

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

// ─── Theme ──────────────────────────────────────────────────────────────────
const theme = {
  colors: {
    bg: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    accent: '#F59E0B',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: '#334155',
    success: '#10B981',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 12, lg: 20 },
  font: { title: 28, h1: 22, h2: 18, body: 15, small: 13 },
};

// ─── Data ───────────────────────────────────────────────────────────────────
const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'dev', label: 'Desarrollo' },
  { id: 'design', label: 'Diseño' },
  { id: 'business', label: 'Negocios' },
  { id: 'marketing', label: 'Marketing' },
];

const courses = [
  {
    id: 'rn-101',
    title: 'React Native desde cero',
    category: 'dev',
    instructor: 'Armando Vanegas',
    level: 'Principiante',
    durationHours: 8,
    rating: 4.8,
    students: 1284,
    price: 49,
    cover: '#6366F1',
    summary:
      'Aprende a construir aplicaciones móviles para iOS y Android con React Native y Expo.',
    lessons: [
      { id: 'l1', title: 'Introducción a React Native', durationMin: 12 },
      { id: 'l2', title: 'Configurando Expo', durationMin: 18 },
      { id: 'l3', title: 'Tu primera pantalla', durationMin: 22 },
      { id: 'l4', title: 'Navegación entre pantallas', durationMin: 28 },
      { id: 'l5', title: 'Estado y props', durationMin: 24 },
      { id: 'l6', title: 'Consumiendo APIs', durationMin: 30 },
      { id: 'l7', title: 'Publicando tu app', durationMin: 26 },
    ],
  },
  {
    id: 'ui-200',
    title: 'Diseño UI moderno',
    category: 'design',
    instructor: 'Lucía Ramírez',
    level: 'Intermedio',
    durationHours: 6,
    rating: 4.7,
    students: 932,
    price: 39,
    cover: '#F59E0B',
    summary:
      'Domina los fundamentos del diseño de interfaces limpias, accesibles y atractivas.',
    lessons: [
      { id: 'l1', title: 'Principios de diseño visual', durationMin: 15 },
      { id: 'l2', title: 'Tipografía y jerarquía', durationMin: 20 },
      { id: 'l3', title: 'Color y contraste', durationMin: 18 },
      { id: 'l4', title: 'Layout y espaciado', durationMin: 22 },
      { id: 'l5', title: 'Componentes reutilizables', durationMin: 25 },
    ],
  },
  {
    id: 'biz-101',
    title: 'Funda tu startup',
    category: 'business',
    instructor: 'Carlos Méndez',
    level: 'Principiante',
    durationHours: 5,
    rating: 4.6,
    students: 612,
    price: 29,
    cover: '#10B981',
    summary:
      'Desde la idea hasta el primer cliente: validación, MVP y crecimiento temprano.',
    lessons: [
      { id: 'l1', title: 'Validar tu idea', durationMin: 14 },
      { id: 'l2', title: 'Construir un MVP', durationMin: 20 },
      { id: 'l3', title: 'Primeros usuarios', durationMin: 18 },
      { id: 'l4', title: 'Modelos de negocio', durationMin: 22 },
    ],
  },
  {
    id: 'mkt-150',
    title: 'Growth Marketing práctico',
    category: 'marketing',
    instructor: 'Ana Torres',
    level: 'Intermedio',
    durationHours: 7,
    rating: 4.9,
    students: 1502,
    price: 45,
    cover: '#EC4899',
    summary:
      'Tácticas reales para hacer crecer un producto digital con presupuesto limitado.',
    lessons: [
      { id: 'l1', title: 'El embudo de crecimiento', durationMin: 16 },
      { id: 'l2', title: 'Adquisición orgánica', durationMin: 24 },
      { id: 'l3', title: 'Activación y onboarding', durationMin: 22 },
      { id: 'l4', title: 'Retención por email', durationMin: 26 },
      { id: 'l5', title: 'Referidos y viralidad', durationMin: 20 },
    ],
  },
  {
    id: 'ts-300',
    title: 'TypeScript avanzado',
    category: 'dev',
    instructor: 'Diego Salazar',
    level: 'Avanzado',
    durationHours: 9,
    rating: 4.8,
    students: 845,
    price: 59,
    cover: '#3B82F6',
    summary:
      'Tipos genéricos, condicionales, mapeados y patrones del mundo real con TypeScript.',
    lessons: [
      { id: 'l1', title: 'Repaso del sistema de tipos', durationMin: 18 },
      { id: 'l2', title: 'Genéricos en profundidad', durationMin: 28 },
      { id: 'l3', title: 'Tipos condicionales', durationMin: 30 },
      { id: 'l4', title: 'Tipos mapeados', durationMin: 26 },
      { id: 'l5', title: 'Patrones reales', durationMin: 32 },
    ],
  },
  {
    id: 'fig-110',
    title: 'Figma para producto',
    category: 'design',
    instructor: 'Marta Ríos',
    level: 'Principiante',
    durationHours: 4,
    rating: 4.5,
    students: 478,
    price: 25,
    cover: '#8B5CF6',
    summary:
      'Aprende Figma desde cero enfocado en flujos de producto y prototipado.',
    lessons: [
      { id: 'l1', title: 'Tour por Figma', durationMin: 14 },
      { id: 'l2', title: 'Frames y autolayout', durationMin: 22 },
      { id: 'l3', title: 'Componentes y variantes', durationMin: 24 },
      { id: 'l4', title: 'Prototipado', durationMin: 18 },
    ],
  },
];

const getCourseById = (id) => courses.find((c) => c.id === id);

// ─── Components ─────────────────────────────────────────────────────────────
function CategoryChips({ value, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chipStyles.row}
    >
      {categories.map((c) => {
        const active = c.id === value;
        return (
          <Pressable
            key={c.id}
            onPress={() => onChange(c.id)}
            style={[chipStyles.chip, active && chipStyles.chipActive]}
          >
            <Text style={[chipStyles.label, active && chipStyles.labelActive]}>
              {c.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function CourseCard({ course, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardStyles.card, pressed && cardStyles.pressed]}
    >
      <View style={[cardStyles.cover, { backgroundColor: course.cover }]}>
        <Text style={cardStyles.coverEmoji}>
          {course.category === 'dev'
            ? '</>'
            : course.category === 'design'
            ? '✦'
            : course.category === 'business'
            ? '◆'
            : '★'}
        </Text>
      </View>
      <View style={cardStyles.body}>
        <Text style={cardStyles.level}>{course.level.toUpperCase()}</Text>
        <Text style={cardStyles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={cardStyles.instructor} numberOfLines={1}>
          {course.instructor}
        </Text>
        <View style={cardStyles.meta}>
          <Text style={cardStyles.metaText}>★ {course.rating}</Text>
          <Text style={cardStyles.metaDot}>·</Text>
          <Text style={cardStyles.metaText}>{course.durationHours}h</Text>
          <Text style={cardStyles.metaDot}>·</Text>
          <Text style={cardStyles.price}>${course.price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Screens ────────────────────────────────────────────────────────────────
function HomeScreen({ navigation }) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = category === 'all' || c.category === category;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [category, query]);

  return (
    <SafeAreaView style={homeStyles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={homeStyles.list}
        ListHeaderComponent={
          <View>
            <View style={homeStyles.header}>
              <Text style={homeStyles.greeting}>Hola 👋</Text>
              <Text style={homeStyles.title}>¿Qué quieres aprender hoy?</Text>
            </View>
            <View style={homeStyles.searchWrap}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar cursos o instructores"
                placeholderTextColor={theme.colors.textMuted}
                style={homeStyles.search}
              />
            </View>
            <CategoryChips value={category} onChange={setCategory} />
            <Text style={homeStyles.sectionTitle}>
              {filtered.length} curso{filtered.length === 1 ? '' : 's'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() =>
              navigation.navigate('CourseDetail', { courseId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={homeStyles.empty}>No encontramos cursos.</Text>
        }
      />
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={detailStyles.stat}>
      <Text style={detailStyles.statValue}>{value}</Text>
      <Text style={detailStyles.statLabel}>{label}</Text>
    </View>
  );
}

function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const course = getCourseById(courseId);

  if (!course) {
    return (
      <SafeAreaView style={detailStyles.safe}>
        <Text style={detailStyles.missing}>Curso no encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={detailStyles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={detailStyles.content}>
        <View style={[detailStyles.cover, { backgroundColor: course.cover }]}>
          <Text style={detailStyles.coverTitle}>{course.title}</Text>
          <Text style={detailStyles.coverSubtitle}>
            por {course.instructor}
          </Text>
        </View>

        <View style={detailStyles.statsRow}>
          <Stat label="Nivel" value={course.level} />
          <Stat label="Duración" value={`${course.durationHours} h`} />
          <Stat label="Rating" value={`★ ${course.rating}`} />
        </View>

        <View style={detailStyles.section}>
          <Text style={detailStyles.sectionTitle}>Sobre este curso</Text>
          <Text style={detailStyles.summary}>{course.summary}</Text>
        </View>

        <View style={detailStyles.section}>
          <Text style={detailStyles.sectionTitle}>
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
                detailStyles.lesson,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={detailStyles.lessonIndex}>
                <Text style={detailStyles.lessonIndexText}>{idx + 1}</Text>
              </View>
              <View style={detailStyles.lessonBody}>
                <Text style={detailStyles.lessonTitle}>{lesson.title}</Text>
                <Text style={detailStyles.lessonMeta}>
                  {lesson.durationMin} min
                </Text>
              </View>
              <Text style={detailStyles.lessonChevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={detailStyles.cta}>
        <View>
          <Text style={detailStyles.priceLabel}>Precio</Text>
          <Text style={detailStyles.price}>${course.price}</Text>
        </View>
        <Pressable
          onPress={() =>
            navigation.navigate('Lesson', {
              courseId: course.id,
              lessonId: course.lessons[0].id,
            })
          }
          style={({ pressed }) => [
            detailStyles.enrollBtn,
            pressed && { backgroundColor: theme.colors.primaryDark },
          ]}
        >
          <Text style={detailStyles.enrollText}>Empezar curso</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function LessonScreen({ route, navigation }) {
  const { courseId, lessonId } = route.params;
  const course = getCourseById(courseId);
  const index = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = course?.lessons[index];

  if (!course || !lesson) {
    return (
      <SafeAreaView style={lessonStyles.safe}>
        <Text style={lessonStyles.missing}>Lección no encontrada.</Text>
      </SafeAreaView>
    );
  }

  const prev = index > 0 ? course.lessons[index - 1] : null;
  const next =
    index < course.lessons.length - 1 ? course.lessons[index + 1] : null;

  const goTo = (id) => navigation.setParams({ lessonId: id });

  return (
    <SafeAreaView style={lessonStyles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={lessonStyles.content}>
        <View style={lessonStyles.player}>
          <Text style={lessonStyles.playIcon}>▶</Text>
          <Text style={lessonStyles.playerText}>
            Vista previa de la lección
          </Text>
        </View>

        <View style={lessonStyles.body}>
          <Text style={lessonStyles.eyebrow}>
            Lección {index + 1} de {course.lessons.length}
          </Text>
          <Text style={lessonStyles.title}>{lesson.title}</Text>
          <Text style={lessonStyles.duration}>{lesson.durationMin} min</Text>

          <View style={lessonStyles.divider} />

          <Text style={lessonStyles.sectionTitle}>Resumen</Text>
          <Text style={lessonStyles.text}>
            En esta lección de{' '}
            <Text style={{ fontWeight: '700' }}>{course.title}</Text>{' '}
            aprenderás los conceptos clave de "{lesson.title}". Mira el video,
            completa los ejercicios y avanza a la siguiente lección cuando
            estés listo.
          </Text>

          <Text style={lessonStyles.sectionTitle}>Lo que verás</Text>
          {[
            'Conceptos clave explicados paso a paso',
            'Ejemplos prácticos en código',
            'Ejercicio guiado al final',
          ].map((item) => (
            <View key={item} style={lessonStyles.bulletRow}>
              <View style={lessonStyles.bulletDot} />
              <Text style={lessonStyles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={lessonStyles.nav}>
        <Pressable
          disabled={!prev}
          onPress={() => prev && goTo(prev.id)}
          style={[lessonStyles.navBtn, !prev && lessonStyles.navBtnDisabled]}
        >
          <Text
            style={[
              lessonStyles.navText,
              !prev && lessonStyles.navTextDisabled,
            ]}
          >
            ‹ Anterior
          </Text>
        </Pressable>
        <Pressable
          disabled={!next}
          onPress={() => next && goTo(next.id)}
          style={[
            lessonStyles.navBtn,
            lessonStyles.navBtnPrimary,
            !next && lessonStyles.navBtnDisabled,
          ]}
        >
          <Text style={[lessonStyles.navText, { color: '#FFFFFF' }]}>
            {next ? 'Siguiente ›' : 'Finalizar'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Navigation ─────────────────────────────────────────────────────────────
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.bg,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.bg },
            headerTitleStyle: { color: theme.colors.text, fontWeight: '700' },
            headerTintColor: theme.colors.text,
            contentStyle: { backgroundColor: theme.colors.bg },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
            options={{ title: '', headerTransparent: true }}
          />
          <Stack.Screen
            name="Lesson"
            component={LessonScreen}
            options={{ title: 'Lección' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const chipStyles = StyleSheet.create({
  row: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    marginRight: theme.spacing.sm,
  },
  chipActive: { backgroundColor: theme.colors.primary },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    fontWeight: '600',
  },
  labelActive: { color: '#FFFFFF' },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  cover: { height: 110, alignItems: 'center', justifyContent: 'center' },
  coverEmoji: { fontSize: 36, color: '#FFFFFF', fontWeight: '800' },
  body: { padding: theme.spacing.md },
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
  meta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { color: theme.colors.textMuted, fontSize: theme.font.small },
  metaDot: { color: theme.colors.textMuted, marginHorizontal: 6 },
  price: {
    color: theme.colors.text,
    fontSize: theme.font.small,
    fontWeight: '700',
  },
});

const homeStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  list: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: { paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md },
  greeting: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    marginBottom: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.title,
    fontWeight: '800',
  },
  searchWrap: { marginBottom: theme.spacing.md },
  search: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.font.body,
  },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 4,
  },
  empty: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

const detailStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingBottom: theme.spacing.xl },
  cover: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 2,
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
  stat: { flex: 1, alignItems: 'center' },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.font.h2,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: { color: theme.colors.textMuted, fontSize: theme.font.small },
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
  lessonIndexText: { color: theme.colors.text, fontWeight: '700' },
  lessonBody: { flex: 1 },
  lessonTitle: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  lessonMeta: { color: theme.colors.textMuted, fontSize: theme.font.small },
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
  priceLabel: { color: theme.colors.textMuted, fontSize: theme.font.small },
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

const lessonStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  content: { paddingBottom: theme.spacing.xl },
  player: {
    height: 220,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#FFFFFF', fontSize: 48, marginBottom: 6 },
  playerText: { color: 'rgba(255,255,255,0.7)', fontSize: theme.font.small },
  body: { padding: theme.spacing.md },
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
  duration: { color: theme.colors.textMuted, fontSize: theme.font.small },
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
  bulletText: { color: theme.colors.text, fontSize: theme.font.body },
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
  navBtnPrimary: { backgroundColor: theme.colors.primary },
  navBtnDisabled: { opacity: 0.4 },
  navText: { color: theme.colors.text, fontWeight: '700' },
  navTextDisabled: { color: theme.colors.textMuted },
  missing: {
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
