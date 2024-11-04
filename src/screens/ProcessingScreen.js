import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateContent } from '../services/openaiService';
import { PROCESSING_SCREEN, ERROR_MESSAGES } from '../constants/uiStrings';

const ProcessingScreen = ({ route, navigation }) => {
  const { timestamp } = route.params;
  const [recording, setRecording] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    loadRecording();
  }, []);

  const loadRecording = async () => {
    try {
      const data = await AsyncStorage.getItem(`recording_${timestamp}`);
      if (data) {
        setRecording(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error al cargar la grabación:', error);
      Alert.alert('Error', ERROR_MESSAGES.LOAD_ERROR);
    }
  };

  const processContent = async (type) => {
    if (processing) return;
    
    setProcessing(true);
    try {
      if (!recording.transcription) {
        Alert.alert('Error', 'No se encontró la transcripción del audio');
        return;
      }

      let stepMessage = '';
      switch (type) {
        case 'summary':
          stepMessage = PROCESSING_SCREEN.GENERATING_SUMMARY;
          break;
        case 'minutes':
          stepMessage = PROCESSING_SCREEN.CREATING_MINUTES;
          break;
        case 'analysis':
          stepMessage = PROCESSING_SCREEN.PERFORMING_ANALYSIS;
          break;
      }
      setCurrentStep(stepMessage);

      const content = await generateContent(recording.transcription, type);
      const updatedRecording = {
        ...recording,
        [type]: content
      };

      await AsyncStorage.setItem(
        `recording_${timestamp}`,
        JSON.stringify(updatedRecording)
      );

      setRecording(updatedRecording);
      navigation.navigate('Detail', { recording: updatedRecording });
    } catch (error) {
      console.error('Error en el procesamiento:', error);
      Alert.alert('Error', error.message);
    } finally {
      setProcessing(false);
      setCurrentStep('');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{PROCESSING_SCREEN.TITLE}</Text>
      
      {processing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.processingText}>{currentStep}</Text>
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => processContent('summary')}
          >
            <Text style={styles.optionText}>{PROCESSING_SCREEN.OPTIONS.SUMMARY}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => processContent('minutes')}
          >
            <Text style={styles.optionText}>{PROCESSING_SCREEN.OPTIONS.MINUTES}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => processContent('analysis')}
          >
            <Text style={styles.optionText}>{PROCESSING_SCREEN.OPTIONS.ANALYSIS}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  option: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default ProcessingScreen;
