import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const RecordingScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState(null);

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
        Alert.alert('Permissions required', 'Audio recording permissions are required');
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
      
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      setTimer(interval);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
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
      const timestamp = Date.now();
      
      // Save recording data
      const recordingData = {
        timestamp,
        audioUri: uri,
        transcription: null,
        summary: null,
        minutes: null,
        analysis: null
      };

      await AsyncStorage.setItem(
        `recording_${timestamp}`,
        JSON.stringify(recordingData)
      );

      // Navigate to processing screen
      navigation.replace('Processing', { timestamp });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(duration)}</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <View style={[styles.recordButtonInner, isRecording && styles.recordingButtonInner]} />
      </TouchableOpacity>
      
      <Text style={styles.instructions}>
        {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timerContainer: {
    marginBottom: 50,
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
    marginBottom: 20,
  },
  recordingButton: {
    backgroundColor: '#ff0000',
  },
  recordButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 5,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
  },
});

export default RecordingScreen;
