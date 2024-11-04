import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateContent, translateText } from '../services/openaiService';
import { DETAIL_SCREEN, ERROR_MESSAGES, RECORDING_BUTTONS, LANGUAGES } from '../constants/uiStrings';

const DetailScreen = ({ route, navigation }) => {
  const { recording: initialRecording } = route.params;
  const [recording, setRecording] = useState(initialRecording);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentProcess, setCurrentProcess] = useState('');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    transcription: false,
    summary: false,
    minutes: false,
    analysis: false,
    translation: false
  });

  const CHAR_LIMIT = 200;

  useEffect(() => {
    if (initialRecording && !initialRecording.summary) {
      generateText('summary');
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const formatDuration = (durationMillis) => {
    if (!durationMillis) return '0:00';
    const totalSeconds = Math.floor(durationMillis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const truncateText = (text, limit) => {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

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

  const shareContent = async (type) => {
    try {
      let message = `${recording.title}\n${new Date(recording.timestamp).toLocaleString()}\n\n`;
      
      switch(type) {
        case 'transcription':
          message += `${DETAIL_SCREEN.TRANSCRIPTION}:\n${recording.transcription}`;
          break;
        case 'summary':
          message += `${DETAIL_SCREEN.SUMMARY}:\n${recording.summary}`;
          break;
        case 'minutes':
          message += `${DETAIL_SCREEN.MINUTES}:\n${recording.minutes}`;
          break;
        case 'analysis':
          message += `${DETAIL_SCREEN.ANALYSIS}:\n${recording.analysis}`;
          break;
        case 'translation':
          message += `${DETAIL_SCREEN.TRANSLATION}:\n${recording.translation}`;
          break;
      }

      await Share.share({
        message,
        title: `SmartRecorder - ${recording.title} - ${DETAIL_SCREEN[type.toUpperCase()]}`,
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

  const handleTranslate = async (targetLanguage) => {
    if (!recording.transcription) {
      Alert.alert(DETAIL_SCREEN.NO_TRANSCRIPTION);
      return;
    }

    setShowLanguageModal(false);
    setProcessing(true);
    setCurrentProcess('translation');

    try {
      const translatedText = await translateText(recording.transcription, targetLanguage);
      const updatedRecording = {
        ...recording,
        translation: translatedText
      };

      await AsyncStorage.setItem(
        `recording_${recording.timestamp}`,
        JSON.stringify(updatedRecording)
      );

      setRecording(updatedRecording);
    } catch (error) {
      console.error('Error al traducir:', error);
      Alert.alert(ERROR_MESSAGES.TRANSLATION_ERROR);
    } finally {
      setProcessing(false);
      setCurrentProcess('');
    }
  };

  const renderLanguageModal = () => (
    <Modal
      visible={showLanguageModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{DETAIL_SCREEN.SELECT_LANGUAGE}</Text>
          <FlatList
            data={Object.entries(LANGUAGES)}
            keyExtractor={([code]) => code}
            renderItem={({ item: [code, name] }) => (
              <TouchableOpacity
                style={styles.languageItem}
                onPress={() => handleTranslate(code)}
              >
                <Text style={styles.languageText}>{name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowLanguageModal(false)}
          >
            <Text style={styles.closeButtonText}>{DETAIL_SCREEN.BACK}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSection = (type, content) => {
    const titles = {
      transcription: DETAIL_SCREEN.TRANSCRIPTION,
      summary: DETAIL_SCREEN.SUMMARY,
      minutes: DETAIL_SCREEN.MINUTES,
      analysis: DETAIL_SCREEN.ANALYSIS,
      translation: DETAIL_SCREEN.TRANSLATION
    };

    const noContentMessages = {
      transcription: DETAIL_SCREEN.NO_TRANSCRIPTION,
      summary: DETAIL_SCREEN.NO_SUMMARY,
      minutes: DETAIL_SCREEN.NO_MINUTES,
      analysis: DETAIL_SCREEN.NO_ANALYSIS,
      translation: DETAIL_SCREEN.NO_TRANSLATION
    };

    const displayText = content ? (
      expandedSections[type] ? content : truncateText(content, CHAR_LIMIT)
    ) : noContentMessages[type];

    const shouldShowExpandButton = content && content.length > CHAR_LIMIT;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{titles[type]}</Text>
          <View style={styles.sectionActions}>
            {type !== 'transcription' && !content && (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={() => type === 'translation' ? setShowLanguageModal(true) : generateText(type)}
                disabled={processing}
              >
                {processing && currentProcess === type ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <Text style={styles.generateButtonText}>
                    {type === 'translation' ? DETAIL_SCREEN.TRANSLATE : DETAIL_SCREEN.GENERATE}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {content && (
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => shareContent(type)}
              >
                <Text style={styles.shareButtonText}>Compartir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.sectionContent}>
          {displayText}
        </Text>
        {shouldShowExpandButton && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleSection(type)}
          >
            <Text style={styles.expandButtonText}>
              {expandedSections[type] ? 'Ver menos' : 'Ver más'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{recording.title}</Text>
        </View>
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
        <View style={styles.dateContainer}>
          <Text style={styles.date}>
            {new Date(recording.timestamp).toLocaleString()}
          </Text>
          <Text style={styles.duration}>
            Duración: {formatDuration(recording.durationMillis)}
          </Text>
        </View>

        {renderSection('transcription', recording.transcription)}
        {renderSection('summary', recording.summary)}
        {renderSection('minutes', recording.minutes)}
        {renderSection('analysis', recording.analysis)}
        {renderSection('translation', recording.translation)}
      </ScrollView>

      {renderLanguageModal()}
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
  titleContainer: {
    flex: 1,
    marginRight: 15,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  dateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  duration: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
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
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  expandButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  expandButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  languageItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetailScreen;
