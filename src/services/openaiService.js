import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getOpenAIKey = async () => {
  const apiKey = await AsyncStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error('Por favor, configura tu clave API de OpenAI en ajustes');
  }
  return apiKey;
};

export const transcribeAudio = async (audioUri) => {
  try {
    const apiKey = await getOpenAIKey();
    
    // Crear un objeto FormData con el archivo de audio
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'audio.m4a'
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', 
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    if (!response.data || !response.data.text) {
      throw new Error('La respuesta de transcripción no tiene el formato esperado');
    }

    return response.data.text;
  } catch (error) {
    console.error('Error en la transcripción:', error);
    if (error.response) {
      // Error de la API de OpenAI
      const message = error.response.data?.error?.message || 'Error al transcribir el audio';
      throw new Error(`Error de OpenAI: ${message}`);
    } else if (error.request) {
      // Error de red
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet');
    }
    // Error general
    throw new Error('Error al transcribir el audio: ' + error.message);
  }
};

export const generateContent = async (transcription, type) => {
  try {
    const apiKey = await getOpenAIKey();
    
    let prompt = '';
    switch (type) {
      case 'summary':
        prompt = `Por favor, proporciona un resumen conciso del siguiente texto en español:\n\n${transcription}`;
        break;
      case 'minutes':
        prompt = `Por favor, crea un acta formal de reunión a partir del siguiente texto en español. 
                 Incluye fecha, participantes (si se mencionan), puntos tratados, decisiones tomadas y próximos pasos:\n\n${transcription}`;
        break;
      case 'analysis':
        prompt = `Por favor, proporciona un análisis detallado del siguiente texto en español, 
                 incluyendo temas principales, puntos clave, y recomendaciones si aplican:\n\n${transcription}`;
        break;
      default:
        throw new Error('Tipo de contenido no válido');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente experto en análisis y síntesis de texto en español.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('La respuesta no tiene el formato esperado');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error en la generación de contenido:', error);
    if (error.response) {
      // Error de la API de OpenAI
      const message = error.response.data?.error?.message || 'Error al generar el contenido';
      throw new Error(`Error de OpenAI: ${message}`);
    } else if (error.request) {
      // Error de red
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet');
    }
    // Error general
    throw new Error('Error al generar el contenido: ' + error.message);
  }
};
