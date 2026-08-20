# EmoTEA: práctica de expresiones faciales mediante visión artificial

## Resumen

**EmoTEA** es una aplicación web experimental desarrollada en el contexto de un Trabajo Fin de Grado para estudiar la detección facial en el navegador mediante [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js). La aplicación captura vídeo de la cámara, identifica una cara, obtiene sus *landmarks* y *blendshapes* faciales, estima una emoción básica mediante reglas heurísticas y propone ejercicios para practicar expresiones faciales.

El sistema incorpora una fase de calibración de la expresión neutral. Durante la calibración se calcula la media de los valores de los *blendshapes* observados y, posteriormente, estos valores se utilizan como línea base para normalizar la detección en tiempo real.

> **Alcance actual.** El proyecto implementa una herramienta de detección y práctica de expresiones faciales. No incluye un avatar 3D, un modelo neuronal específico de clasificación emocional ni una validación clínica o psicológica de las emociones detectadas.

## Objetivos

- Explorar el uso de MediaPipe Face Landmarker en una aplicación web modular.
- Obtener *landmarks* y *blendshapes* faciales a partir de vídeo en tiempo real.
- Reducir la influencia de la expresión neutral de cada usuario mediante calibración.
- Proporcionar una dinámica interactiva para practicar seis expresiones emocionales básicas.
- Mantener una arquitectura sencilla, ejecutable íntegramente en el navegador y sin servidor propio.

## Funcionalidades

### Detección facial

La vista de práctica solicita permiso para acceder a la cámara y procesa el vídeo en modo `VIDEO`. MediaPipe Face Landmarker se configura para detectar una única cara y generar:

- Coordenadas normalizadas de los *landmarks* faciales.
- Categorías de *blendshapes* con sus puntuaciones.
- Mallas de referencia para visualizar ojos, cejas, iris, labios y contorno facial.

La malla facial se dibuja sobre un elemento `canvas` superpuesto al vídeo. La aplicación muestra asimismo la emoción aproximada detectada en cada actualización del vídeo.

### Calibración

La pantalla de calibración solicita al usuario mantener una expresión neutral durante aproximadamente tres segundos. A partir de las muestras obtenidas se calcula la media de cada *blendshape* y se guarda una línea base en el estado de la aplicación.

La calibración es opcional para acceder a la práctica, aunque la aplicación la recomienda. El estado se conserva únicamente mientras la página permanece cargada.

### Práctica de emociones

Los ejercicios se presentan en orden aleatorio. Cada ejercicio requiere que la emoción objetivo sea detectada durante cinco segundos acumulados. Si la emoción deja de coincidir, el progreso se mantiene y deja de aumentar hasta que vuelve a detectarse la expresión correcta.

Las emociones contempladas son:

- Alegría
- Sorpresa
- Enfado
- Tristeza
- Miedo
- Asco

El panel de ejercicios muestra la emoción objetivo, una descripción, la emoción detectada, el progreso y las acciones para saltar o completar el ejercicio.

## Estimación heurística de emociones

La función `obtenerEmocionAproximada` de `services/gesture_recognition.js` combina diferentes *blendshapes* asociados a las expresiones faciales. Por ejemplo, la alegría utiliza principalmente la sonrisa y la contracción de las mejillas; la sorpresa combina la apertura de la mandíbula, la elevación de las cejas y la apertura de los ojos.

La emoción dominante se selecciona mediante puntuaciones ponderadas y un umbral mínimo. Si ninguna puntuación es suficientemente alta, el resultado es `Neutral`; si no existen resultados faciales, se devuelve `Desconocida`.

Este procedimiento es una aproximación experimental inspirada en las emociones básicas de Ekman y en unidades de acción del sistema FACS. Las puntuaciones no deben interpretarse como una medición objetiva del estado emocional de una persona.

## Arquitectura

La aplicación es una SPA (*Single-Page Application*) basada en JavaScript modular y renderizado mediante plantillas HTML. La navegación se realiza con el fragmento de la URL (`window.location.hash`), sin backend ni base de datos.

### Flujo de ejecución

1. `main.js` inserta la cabecera y el pie de página e inicializa el router.
2. `router.js` selecciona el componente correspondiente a la ruta actual.
3. `components/mainMenu.js` permite iniciar la práctica o la calibración.
4. `components/calibrationComponent.js` recoge la expresión neutral y actualiza el estado compartido.
5. `components/display.js` inicia la cámara, ejecuta la detección en tiempo real y actualiza la interfaz.
6. `components/exercise.js` sincroniza el resultado de la detección con el progreso del ejercicio.

### Rutas disponibles

| Ruta | Vista | Descripción |
| --- | --- | --- |
| `#/` | Menú principal | Acceso a la práctica y a la calibración. |
| `#/display` | Práctica de emociones | Vídeo, malla facial, emoción detectada y ejercicios. |
| `#/calibration` | Calibración | Captura de la expresión neutral del usuario. |
| Cualquier otra | Error 404 | Ruta no encontrada. |

## Organización del código

```text
tfg-avatar-virtual/
├── app/shared/models/
│   └── face_landmarker.task       # Modelo local de MediaPipe
├── assets/fonts/                  # Fuente Lexend
├── components/
│   ├── calibrationComponent.js    # Vista y flujo de calibración
│   ├── display.js                 # Detección y práctica en tiempo real
│   ├── exercise.js                # Interfaz de los ejercicios
│   ├── footer.js                  # Pie de página
│   ├── header.js                  # Cabecera
│   └── mainMenu.js                # Menú principal
├── services/
│   ├── exercise_manager.js        # Estado y temporización de ejercicios
│   ├── gesture_recognition.js     # Inferencia heurística de emociones
│   ├── mediapipe_example.js       # Ejemplo de referencia de MediaPipe
│   ├── store.js                   # Estado de la calibración
│   └── vision.js                  # Carga y ejecución de Face Landmarker
├── index.html                     # Documento HTML de entrada
├── main.js                        # Punto de entrada
├── router.js                      # Enrutamiento por hash
├── package.json                   # Scripts y dependencias
└── package-lock.json              # Versiones resueltas de npm
```

## Tecnologías y dependencias

- JavaScript ES Modules.
- [Vite](https://vite.dev/) como servidor de desarrollo y herramienta de compilación.
- [`@mediapipe/tasks-vision`](https://www.npmjs.com/package/@mediapipe/tasks-vision) para Face Landmarker.
- Tailwind CSS cargado desde CDN para los estilos de la interfaz.
- Material Icons cargado desde Google Fonts.
- WebAssembly y aceleración `GPU` para la ejecución del modelo cuando el navegador lo permite.
- Modelo `face_landmarker.task` incluido en el repositorio.

Las dependencias npm principales se declaran en `package.json`:

```json
{
	"dependencies": {
		"@mediapipe/tasks-vision": "^0.10.32"
	},
	"devDependencies": {
		"vite": "^6.0.0"
	}
}
```

## Requisitos

- Node.js y npm instalados.
- Navegador moderno con soporte para módulos ES, WebAssembly y `navigator.mediaDevices.getUserMedia`.
- Cámara disponible y permiso de uso concedido.
- Conexión a Internet para descargar Tailwind CSS, Material Icons y el runtime WASM de MediaPipe.

El acceso a la cámara requiere un contexto seguro. `localhost` es válido durante el desarrollo; para un despliegue remoto se debe utilizar HTTPS.

## Instalación y ejecución

Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Vite mostrará la dirección local de la aplicación, normalmente `http://localhost:5173`.

Para generar y previsualizar una compilación de producción:

```bash
npm run build
npm run preview
```

## Uso básico

1. Abrir la aplicación desde la URL proporcionada por Vite.
2. Seleccionar **Calibrar** y mantener una expresión neutral durante el proceso.
3. Volver a la pantalla de práctica.
4. Seleccionar **Reiniciar detector facial** para activar el procesamiento del vídeo.
5. Iniciar los ejercicios y mantener cada expresión objetivo durante cinco segundos acumulados.

Si el navegador bloquea la cámara, hay que revisar los permisos del sitio y que la cámara no esté siendo utilizada exclusivamente por otra aplicación.

## Limitaciones conocidas

- La línea base neutral se guarda solo en memoria y se pierde al recargar la página.
- La clasificación emocional se basa en reglas manuales y no ha de considerarse reconocimiento emocional clínico.
- Solo se procesa una cara por fotograma.
- El delegado `GPU` se solicita de forma explícita y no existe un mecanismo de configuración para seleccionar CPU desde la interfaz.
- La aplicación depende de varios recursos externos servidos por CDN.
- La ruta de reconocimiento independiente aparece preparada en el router, pero actualmente está comentada y no está implementada.
- `services/mediapipe_example.js` es un ejemplo de referencia y no forma parte del flujo principal de la aplicación.
- La detención explícita de la cámara al abandonar una vista y la persistencia de la calibración son mejoras pendientes.

## Trabajo futuro

Como líneas de evolución se proponen:

- Persistir la calibración de forma controlada y permitir restablecerla.
- Añadir gestión del ciclo de vida de las pistas de vídeo al cambiar de ruta.
- Incorporar una estrategia de fallback cuando no esté disponible la aceleración GPU.
- Separar la lógica de inferencia en un módulo testeable y añadir pruebas automatizadas.
- Evaluar la heurística con un conjunto de datos documentado antes de extraer conclusiones sobre su precisión.
- Implementar la vista de reconocimiento pendiente o un avatar visual que represente los resultados.

## Autoría

Proyecto desarrollado por **Javier Sánchez** como parte de un Trabajo Fin de Grado.