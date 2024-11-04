# SmartRecorder - Documentación

SmartRecorder es una aplicación móvil que permite grabar audio, transcribirlo y generar diferentes tipos de contenido a partir de la transcripción utilizando la API de OpenAI.

## Arquitectura Técnica

### Stack Tecnológico
- **Framework Principal**: Descripción: Ionic es un framework para desarrollar aplicaciones híbridas utilizando tecnologías web como HTML, CSS y JavaScript. Capacitor permite acceder a funcionalidades nativas.
- **Seguridad**: Manejo seguro de claves API y permisos

### Configuración de Plataformas

#### iOS
- Soporte para tablets
- Modo de audio en segundo plano
- Permisos de micrófono personalizados

#### Android
- Permisos específicos:
  - RECORD_AUDIO
  - FOREGROUND_SERVICE
- Package: com.smartrecorder.app
- Icono adaptativo configurado

### Características Técnicas
- Arquitectura basada en navegación por stack
- Gestión de estado local por pantalla
- Sistema de permisos integrado
- Manejo asíncrono de operaciones de E/S
- Integración con APIs externas (OpenAI)
- Almacenamiento persistente de configuraciones

## Estructura del Código



## Pantallas y Funcionalidades

### 1. Pantalla Principal 

**Funcionalidades:**
- Lista todas las grabaciones realizadas
- Muestra la fecha y hora de cada grabación
- Indica mediante badges el tipo de contenido generado para cada grabación:
  - 🟢 Resumen
  - 🔵 Acta
  - 🟣 Análisis
- Permite eliminar grabaciones existentes
- Botones de navegación:
  - Botón de configuración (esquina inferior izquierda)
  - Botón de grabación (centro inferior)

### 2. Pantalla de Grabación



**Funcionalidades:**
- Interfaz para grabar audio
- Configuración inicial del audio antes de grabar
- Muestra el tiempo de grabación en formato mm:ss
- Botón para iniciar/detener la grabación
- Al finalizar la grabación:
  - Guarda el archivo de audio
  - Transcribe el audio usando la API de OpenAI (Whisper)
  - Navega automáticamente a la pantalla de procesamiento

### 3. Pantalla de Procesamiento 


**Funcionalidades:**
- Muestra opciones para procesar la transcripción:
  1. **Generar Resumen**: Crea un resumen conciso del contenido
  2. **Crear Acta de Reunión**: Genera un acta formal con puntos principales y decisiones
  3. **Desarrollar Texto Descriptivo**: Realiza un análisis detallado del contenido
- Utiliza GPT-3.5-turbo para generar el contenido
- Guarda los resultados en el archivo JSON de la grabación
- Permite navegar al detalle de la grabación o volver al inicio

### 4. Pantalla de Detalle

**Funcionalidades:**
- Muestra toda la información de una grabación:
  - Fecha y hora de la grabación
  - Botón para reproducir el audio
  - Transcripción completa
  - Resumen (si existe)
  - Acta de reunión (si existe)
  - Análisis detallado (si existe)
- Permite editar el nombre de la grabación
- Genera contenido adicional basado en la transcripción
- Comparte la grabación y su contenido a través de diferentes plataformas
- Organiza la información en secciones claramente diferenciadas

### 5. Pantalla de Configuración 

**Funcionalidades:**
- Permite configurar la clave API de OpenAI
- Carga y guarda la clave de forma segura usando AsyncStorage
- Muestra la clave de forma oculta por seguridad

## Almacenamiento de Datos

La aplicación almacena:
- Archivos de audio en `FileSystem.documentDirectory + 'recordings/'`
- Datos de grabaciones en archivos JSON con el formato `recording_[timestamp].json`
- Clave API de OpenAI en AsyncStorage con la clave 'openai_api_key'

## Estructura de los Archivos JSON

Cada grabación se almacena en un archivo JSON con la siguiente estructura:

```json
{
  "timestamp": 1234567890,
  "audioUri": "path/to/audio.m4a",
  "transcription": "Texto transcrito del audio",
  "summary": "Resumen generado (opcional)",
  "minutes": "Acta de reunión generada (opcional)",
  "analysis": "Análisis detallado generado (opcional)"
}
