import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailScreen = ({ route, navigation }) => {
  const { recording } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
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
      console.error('Error playing audio:', error);
    }
  };

  const shareContent = async () => {
    try {
      let message = `Recording from ${new Date(recording.timestamp).toLocaleString()}\n\n`;
      
      if (recording.transcription) {
        message += `Transcription:\n${recording.transcription}\n\n`;
      }
      
      if (recording.summary) {
        message += `Summary:\n${recording.summary}\n\n`;
      }
      
      if (recording.minutes) {
        message += `Meeting Minutes:\n${recording.minutes}\n\n`;
      }
      
      if (recording.analysis) {
        message += `Analysis:\n${recording.analysis}`;
      }

      await Share.share({
        message,
        title: `SmartRecorder - ${new Date(recording.timestamp).toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };

  const renderSection = (title, content) => {
    if (!content) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionContent}>{content}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>
          {new Date(recording.timestamp).toLocaleString()}
        </Text>
        <TouchableOpacity
          style={styles.playButton}
          onPress={playAudio}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderSection('Transcription', recording.transcription)}
      {renderSection('Summary', recording.summary)}
      {renderSection('Meeting Minutes', recording.minutes)}
      {renderSection('Analysis', recording.analysis)}

      <TouchableOpacity
        style={styles.shareButton}
        onPress={shareContent}
      >
        <Text style={styles.shareButtonText}>Share Content</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
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
