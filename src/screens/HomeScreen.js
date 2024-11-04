import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HOME_SCREEN, RECORDING_BUTTONS, DETAIL_SCREEN } from '../constants/uiStrings';

const HomeScreen = ({ navigation }) => {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadRecordings();
    });

    return unsubscribe;
  }, [navigation]);

  const loadRecordings = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const recordingKeys = keys.filter(key => key.startsWith('recording_'));
      const loadedRecordings = await Promise.all(
        recordingKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          return JSON.parse(data);
        })
      );
      setRecordings(loadedRecordings.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error al cargar grabaciones:', error);
    }
  };

  const deleteRecording = async (timestamp) => {
    Alert.alert(
      HOME_SCREEN.DELETE_CONFIRMATION,
      '',
      [
        {
          text: HOME_SCREEN.CANCEL,
          style: 'cancel'
        },
        {
          text: HOME_SCREEN.DELETE_BUTTON,
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`recording_${timestamp}`);
              Alert.alert(HOME_SCREEN.DELETE_SUCCESS);
              loadRecordings();
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert(HOME_SCREEN.DELETE_ERROR);
            }
          }
        }
      ]
    );
  };

  const renderBadges = (item) => {
    return (
      <View style={styles.badgeContainer}>
        {item.summary && <Text style={styles.badge}>📝</Text>}
        {item.minutes && <Text style={styles.badge}>📋</Text>}
        {item.analysis && <Text style={styles.badge}>📊</Text>}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordingItem}>
      <TouchableOpacity
        style={styles.recordingContent}
        onPress={() => navigation.navigate('Detail', { recording: item })}
      >
        <View style={styles.recordingInfo}>
          <View style={styles.recordingTextContainer}>
            <Text style={styles.recordingTitle}>
              {item.title || DETAIL_SCREEN.DEFAULT_TITLE}
            </Text>
            <Text style={styles.recordingDate}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
          {renderBadges(item)}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteRecording(item.timestamp)}
      >
        <Text style={styles.deleteButtonText}>{RECORDING_BUTTONS.DELETE}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{HOME_SCREEN.TITLE}</Text>
      {recordings.length === 0 ? (
        <Text style={styles.noRecordings}>{HOME_SCREEN.NO_RECORDINGS}</Text>
      ) : (
        <FlatList
          data={recordings}
          renderItem={renderItem}
          keyExtractor={(item) => item.timestamp.toString()}
          style={styles.list}
        />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.buttonText}>{RECORDING_BUTTONS.SETTINGS}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => navigation.navigate('Recording')}
        >
          <Text style={styles.buttonText}>{RECORDING_BUTTONS.RECORD}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 10,
  },
  list: {
    flex: 1,
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordingContent: {
    flex: 1,
  },
  recordingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 14,
    color: '#666',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  badge: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 10,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
  },
  settingsButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -35,
  },
  buttonText: {
    fontSize: 24,
  },
  noRecordings: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default HomeScreen;
