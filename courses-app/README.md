# Cursos — App móvil

App móvil construida con [Expo](https://expo.dev) + React Native para explorar y consumir cursos online.

## Stack

- React Native 0.74 + Expo SDK 51
- React Navigation (native-stack)
- React Native Safe Area Context
- Datos mockeados en `src/data/courses.js`

## Estructura

```
courses-app/
├── App.js                    # Root + navegación
├── app.json                  # Config de Expo
├── package.json
├── babel.config.js
└── src/
    ├── theme.js              # Tokens de diseño
    ├── data/
    │   └── courses.js        # Catálogo de cursos
    ├── components/
    │   ├── CourseCard.js
    │   └── CategoryChips.js
    └── screens/
        ├── HomeScreen.js          # Listado, búsqueda, filtros
        ├── CourseDetailScreen.js  # Detalle + lecciones
        └── LessonScreen.js        # Vista de lección con prev/next
```

## Cómo correr

```bash
cd courses-app
npm install
npm start
```

Después abre el QR con la app **Expo Go** (iOS / Android), o pulsa `i` / `a` para abrir en simulador.

## Funcionalidades

- Pantalla principal con saludo, búsqueda y filtros por categoría
- Listado de cursos con rating, duración y precio
- Detalle del curso con lista de lecciones y CTA "Empezar curso"
- Reproductor de lección con navegación anterior / siguiente
- Tema oscuro consistente
