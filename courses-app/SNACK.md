# Abrir la app en Expo Snack (desde tu móvil)

[Expo Snack](https://snack.expo.dev) es un editor en navegador que ejecuta apps de Expo sin instalar nada en tu PC. Hay dos rutas para abrir esta app:

## Opción A — Pegar el archivo único (la más rápida)

1. Desde el navegador de tu móvil, abre **https://snack.expo.dev**
2. Verás un editor con un `App.js` de ejemplo. **Borra todo su contenido**.
3. Abre [snack/App.js](./snack/App.js) en este repo en otra pestaña.
4. Pulsa el botón **"Raw"** en GitHub para ver el archivo en texto plano.
5. Selecciona todo (mantén presionado y "Seleccionar todo") y cópialo.
6. Vuelve a Snack y pega el contenido en `App.js`.
7. Snack detectará automáticamente las dependencias (`@react-navigation/native`, etc.) y las instalará.
8. En la previsualización (panel derecho o inferior), elige **"My Device"** o **"Web"**:
   - **My Device**: instala la app **Expo Go** desde la App Store / Play Store, abre Snack en el móvil → tap "My Device" → escanea el QR o tap "Run on this device".
   - **Web**: la app corre directamente en el navegador del móvil, sin instalar nada.

## Opción B — Importar desde GitHub (mantiene la estructura multi-archivo)

1. Desde el navegador, abre **https://snack.expo.dev**
2. En el menú superior, busca la opción **"Import from GitHub"** (icono de carpeta o menú "≡").
3. Pega esta URL:
   ```
   https://github.com/armandovanegas/vbc-public-assets/tree/claude/create-new-app-YbxlL/courses-app
   ```
4. Snack importará todos los archivos respetando la estructura (`src/screens`, `src/components`, etc.).
5. Pulsa **Run** y elige el dispositivo / web.

## URL directa para móvil

Para que el QR / preview cargue rápido:

```
https://snack.expo.dev
```

> **Tip**: si la rama cambia, asegúrate de pegar la URL actualizada en la opción B.

## Dependencias usadas

Snack instala estas automáticamente al detectar los `import`:
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `react-native-safe-area-context`
- `react-native-screens`
- `expo-status-bar`

## Si algo falla

- **Errores de versión**: en Snack arriba a la izquierda hay un selector de **SDK**. Asegúrate de que sea **51.0.0**.
- **Pantalla en blanco**: revisa la pestaña "Logs" en Snack para ver el error exacto.
- **Web no funciona pero móvil sí**: algunos componentes nativos de RN no renderizan igual en web; usa "My Device" para la experiencia real.
