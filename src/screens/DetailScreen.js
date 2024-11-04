import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateContent } from '../services/openaiService';
import { DETAIL_SCREEN, ERROR_MESSAGES } from '../constants/uiStrings';

const DetailScreen = ({ route, navigation }) => {
  const { recording: initialRecording } = route.params;
  const [recording, setRecording] = useState(initialRecording);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentProcess, setCurrentProcess] = useState('');

  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playAudio = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: recording.audioUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error al reproducir audio:', error);
    }
  };

  const shareContent = async () => {
    try {
      let message = `Grabación del ${new Date(recording.timestamp).toLocaleString()}\n\n`;
      
      if (recording.transcription) {
        message += `${DETAIL_SCREEN.TRANSCRIPTION}:\n${recording.transcription}\n\n`;
      }
      
      if (recording.summary) {
        message += `${DETAIL_SCREEN.SUMMARY}:\n${recording.summary}\n\n`;
      }
      
      if (recording.minutes) {
        message += `${DETAIL_SCREEN.MINUTES}:\n${recording.minutes}\n\n`;
      }
      
      if (recording.analysis) {
        message += `${DETAIL_SCREEN.ANALYSIS}:\n${recording.analysis}`;
      }

      await Share.share({
        message,
        title: `SmartRecorder - ${new Date(recording.timestamp).toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error al compartir contenido:', error);
    }
  };

  const generateText = async (type) => {
    if (!recording.transcription) {
      Alert.alert(DETAIL_SCREEN.NO_TRANSCRIPTION);
      return;
    }

    setProcessing(true);
    setCurrentProcess(type);

    try {
      const content = await generateContent(recording.transcription, type);
      const updatedRecording = {
        ...recording,
        [type]: content
      };

      await AsyncStorage.setItem(
        `recording_${recording.timestamp}`,
        JSON.stringify(updatedRecording)
      );

      setRecording(updatedRecording);
    } catch (error) {
      console.error('Error al generar contenido:', error);
      Alert.alert(ERROR_MESSAGES.CONTENT_GENERATION_ERROR);
    } finally {
      setProcessing(false);
      setCurrentProcess('');
    }
  };

  const renderSection = (type, content) => {
    const titles = {
      transcription: DETAIL_SCREEN.TRANSCRIPTION,
      summary: DETAIL_SCREEN.SUMMARY,
      minutes: DETAIL_SCREEN.MINUTES,
      analysis: DETAIL_SCREEN.ANALYSIS
    };

    const noContentMessages = {
      transcription: DETAIL_SCREEN.NO_TRANSCRIPTION,
      summary: DETAIL_SCREEN.NO_SUMMARY,
      minutes: DETAIL_SCREEN.NO_MINUTES,
      analysis: DETAIL_SCREEN.NO_ANALYSIS
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{titles[type]}</Text>
          {type !== 'transcription' && !content && (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => generateText(type)}
              disabled={processing}
            >
              {processing && currentProcess === type ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Text style={styles.generateButtonText}>{DETAIL_SCREEN.GENERATE}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.sectionContent}>
          {content || noContentMessages[type]}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{DETAIL_SCREEN.TITLE}</Text>
        <TouchableOpacity
          style={styles.playButton}
          onPress={playAudio}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.date}>
          {new Date(recording.timestamp).toLocaleString()}
        </Text>

        {renderSection('transcription', recording.transcription)}
        {renderSection('summary', recording.summary)}
        {renderSection('minutes', recording.minutes)}
        {renderSection('analysis', recording.analysis)}

        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareContent}
        >
          <Text style={styles.shareButtonText}>Compartir</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    color: '#666',
    padding: 20,
    textAlign: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  generateButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  generateButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetailScreen;
