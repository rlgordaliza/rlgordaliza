import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    loadRecordings();
  }, []);

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
      console.error('Error loading recordings:', error);
    }
  };

  const renderBadges = (item) => {
    return (
      <View style={styles.badgeContainer}>
        {item.summary && <Text style={styles.badge}>🟢</Text>}
        {item.minutes && <Text style={styles.badge}>🔵</Text>}
        {item.analysis && <Text style={styles.badge}>🟣</Text>}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recordingItem}
      onPress={() => navigation.navigate('Detail', { recording: item })}
    >
      <View style={styles.recordingInfo}>
        <Text style={styles.recordingDate}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        {renderBadges(item)}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recordings}
        renderItem={renderItem}
        keyExtractor={(item) => item.timestamp.toString()}
        style={styles.list}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.buttonText}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => navigation.navigate('Recording')}
        >
          <Text style={styles.buttonText}>🎤</Text>
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
  list: {
    flex: 1,
  },
  recordingItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingDate: {
    fontSize: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  badge: {
    fontSize: 16,
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
});

export default HomeScreen;
