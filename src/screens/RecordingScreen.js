import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transcribeAudio } from '../services/openaiService';
import { RECORDING_SCREEN, RECORDING_BUTTONS } from '../constants/uiStrings';

const RecordingScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState(null);
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
      if (recording) stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          RECORDING_SCREEN.PERMISSIONS_REQUIRED,
          RECORDING_SCREEN.PERMISSIONS_MESSAGE
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
      setDuration(0);
      setRecordingFinished(false);
      setAudioUri(null);
      
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      setTimer(interval);
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      Alert.alert(RECORDING_SCREEN.RECORDING_ERROR, error.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      clearInterval(timer);
      setTimer(null);
      setIsRecording(false);

      const uri = recording.getURI();
      setAudioUri(uri);
      setRecordingFinished(true);
    } catch (error) {
      console.error('Error al detener la grabación:', error);
      Alert.alert(RECORDING_SCREEN.RECORDING_ERROR, error.message);
    }
  };

  const saveRecording = async () => {
    try {
      setIsProcessing(true);
      const timestamp = Date.now();

      // Primero transcribimos el audio
      const transcription = await transcribeAudio(audioUri);

      const recordingData = {
        timestamp,
        audioUri,
        transcription,
        summary: null,
        minutes: null,
        analysis: null
      };

      await AsyncStorage.setItem(
        `recording_${timestamp}`,
        JSON.stringify(recordingData)
      );

      Alert.alert(RECORDING_SCREEN.SAVE_SUCCESS);
      navigation.replace('Processing', { timestamp });
    } catch (error) {
      console.error('Error al guardar la grabación:', error);
      Alert.alert(RECORDING_SCREEN.SAVE_ERROR, error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(duration)}</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonIcon}>
          {isRecording ? RECORDING_BUTTONS.STOP : RECORDING_BUTTONS.START}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.instructions}>
        {isRecording ? RECORDING_SCREEN.STOP_RECORDING : RECORDING_SCREEN.START_RECORDING}
      </Text>

      {recordingFinished && (
        <View style={styles.actionButtons}>
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.processingText}>Transcribiendo audio...</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={saveRecording}
              >
                <Text style={styles.actionButtonText}>
                  {RECORDING_SCREEN.SAVE_RECORDING}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.discardButton]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.actionButtonText}>
                  {RECORDING_SCREEN.DISCARD_RECORDING}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 24,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  recordingButton: {
    backgroundColor: '#ff0000',
  },
  buttonIcon: {
    fontSize: 40,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  discardButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
});

export default RecordingScreen;
