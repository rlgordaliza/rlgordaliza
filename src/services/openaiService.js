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

export const generateTitle = async (transcription) => {
  try {
    const apiKey = await getOpenAIKey();
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente experto en generar títulos concisos y descriptivos. Genera un título breve (máximo 50 caracteres) que capture la esencia del contenido.'
          },
          {
            role: 'user',
            content: `Genera un título descriptivo y conciso para esta transcripción:\n\n${transcription}`
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

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error en la generación del título:', error);
    if (error.response) {
      const message = error.response.data?.error?.message || 'Error al generar el título';
      throw new Error(`Error de OpenAI: ${message}`);
    } else if (error.request) {
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet');
    }
    throw new Error('Error al generar el título: ' + error.message);
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

export const translateText = async (text, targetLanguage) => {
  try {
    const apiKey = await getOpenAIKey();

    const languageNames = {
      en: 'inglés',
      fr: 'francés',
      de: 'alemán',
      it: 'italiano',
      pt: 'portugués',
      ru: 'ruso',
      zh: 'chino',
      ja: 'japonés',
      ko: 'coreano'
    };

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un traductor experto. Traduce el siguiente texto al ${languageNames[targetLanguage]} manteniendo el significado y el tono original.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('La respuesta de traducción no tiene el formato esperado');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error en la traducción:', error);
    if (error.response) {
      const message = error.response.data?.error?.message || 'Error al traducir el texto';
      throw new Error(`Error de OpenAI: ${message}`);
    } else if (error.request) {
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet');
    }
    throw new Error('Error al traducir el texto: ' + error.message);
  }
};
