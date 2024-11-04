export const RECORDING_SCREEN = {
  START_RECORDING: 'Toca para empezar a grabar',
  STOP_RECORDING: 'Toca para detener la grabación',
  RECORDING_ERROR: 'Error al grabar',
  PERMISSIONS_REQUIRED: 'Se requieren permisos',
  PERMISSIONS_MESSAGE: 'Se requieren permisos de grabación de audio',
  SAVE_RECORDING: 'Guardar Grabación',
  DISCARD_RECORDING: 'Descartar',
  SAVE_SUCCESS: 'Grabación guardada correctamente',
  SAVE_ERROR: 'Error al guardar la grabación'
};

export const PROCESSING_SCREEN = {
  TITLE: 'Procesar Grabación',
  TRANSCRIBING: 'Transcribiendo audio...',
  GENERATING_SUMMARY: 'Generando resumen...',
  CREATING_MINUTES: 'Creando acta de reunión...',
  PERFORMING_ANALYSIS: 'Realizando análisis...',
  OPTIONS: {
    SUMMARY: 'Generar Resumen 📝',
    MINUTES: 'Crear Acta de Reunión 📋',
    ANALYSIS: 'Desarrollar Análisis 📊'
  }
};

export const HOME_SCREEN = {
  TITLE: 'Mis Grabaciones',
  NO_RECORDINGS: 'No hay grabaciones',
  DELETE_CONFIRMATION: '¿Estás seguro de que quieres eliminar esta grabación?',
  DELETE_BUTTON: 'Eliminar',
  CANCEL: 'Cancelar',
  DELETE_SUCCESS: 'Grabación eliminada correctamente',
  DELETE_ERROR: 'Error al eliminar la grabación'
};

export const DETAIL_SCREEN = {
  TITLE: 'Detalles de la Grabación',
  TRANSCRIPTION: 'Transcripción',
  SUMMARY: 'Resumen',
  MINUTES: 'Acta de Reunión',
  ANALYSIS: 'Análisis',
  NO_TRANSCRIPTION: 'No hay transcripción disponible',
  NO_SUMMARY: 'No hay resumen disponible',
  NO_MINUTES: 'No hay acta disponible',
  NO_ANALYSIS: 'No hay análisis disponible',
  GENERATE: 'Generar',
  PROCESSING: 'Procesando...',
  BACK: 'Volver',
  DATE: 'Fecha',
  TIME: 'Hora'
};

export const RECORDING_BUTTONS = {
  START: '🎙️',
  STOP: '⏹️',
  DELETE: '🗑️',
  SETTINGS: '⚙️',
  RECORD: '🎤'
};

export const ERROR_MESSAGES = {
  TRANSCRIPTION_ERROR: 'Error al transcribir el audio',
  CONTENT_GENERATION_ERROR: 'Error al generar el contenido',
  API_KEY_ERROR: 'Por favor, configura tu clave API de OpenAI en ajustes',
  LOAD_ERROR: 'Error al cargar los datos de la grabación'
};
