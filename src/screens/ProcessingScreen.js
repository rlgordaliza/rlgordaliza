import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
      console.error('Error loading recording:', error);
      Alert.alert('Error', 'Failed to load recording data');
    }
  };

  const getOpenAIKey = async () => {
    try {
      const apiKey = await AsyncStorage.getItem('openai_api_key');
      if (!apiKey) {
        throw new Error('OpenAI API key not found');
      }
      return apiKey;
    } catch (error) {
      throw new Error('Please configure your OpenAI API key in settings');
    }
  };

  const transcribeAudio = async () => {
    try {
      setCurrentStep('Transcribing audio...');
      const apiKey = await getOpenAIKey();
      
      // Here you would implement the actual audio transcription using OpenAI's Whisper API
      // This is a placeholder for the actual implementation
      const transcription = "Placeholder transcription"; // Replace with actual API call
      
      const updatedRecording = {
        ...recording,
        transcription
      };
      
      await AsyncStorage.setItem(
        `recording_${timestamp}`,
        JSON.stringify(updatedRecording)
      );
      
      setRecording(updatedRecording);
      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  };

  const generateContent = async (type) => {
    if (processing) return;
    
    setProcessing(true);
    try {
      let transcription = recording.transcription;
      if (!transcription) {
        transcription = await transcribeAudio();
      }

      const apiKey = await getOpenAIKey();
      let prompt = '';
      let contentKey = '';

      switch (type) {
        case 'summary':
          setCurrentStep('Generating summary...');
          prompt = `Please provide a concise summary of the following text:\n\n${transcription}`;
          contentKey = 'summary';
          break;
        case 'minutes':
          setCurrentStep('Creating meeting minutes...');
          prompt = `Please create formal meeting minutes from the following transcript:\n\n${transcription}`;
          contentKey = 'minutes';
          break;
        case 'analysis':
          setCurrentStep('Performing analysis...');
          prompt = `Please provide a detailed analysis of the following text:\n\n${transcription}`;
          contentKey = 'analysis';
          break;
      }

      // Here you would make the actual API call to OpenAI
      // This is a placeholder for the actual implementation
      const generatedContent = `Placeholder ${type}`; // Replace with actual API call

      const updatedRecording = {
        ...recording,
        [contentKey]: generatedContent
      };

      await AsyncStorage.setItem(
        `recording_${timestamp}`,
        JSON.stringify(updatedRecording)
      );

      setRecording(updatedRecording);
      navigation.navigate('Detail', { recording: updatedRecording });
    } catch (error) {
      console.error('Content generation error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setProcessing(false);
      setCurrentStep('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Process Recording</Text>
      
      {processing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.processingText}>{currentStep}</Text>
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => generateContent('summary')}
          >
            <Text style={styles.optionText}>Generate Summary 🟢</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => generateContent('minutes')}
          >
            <Text style={styles.optionText}>Create Meeting Minutes 🔵</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => generateContent('analysis')}
          >
            <Text style={styles.optionText}>Develop Analysis 🟣</Text>
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
