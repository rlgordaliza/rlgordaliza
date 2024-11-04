import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem('openai_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const saveApiKey = async () => {
    try {
      if (!apiKey.trim()) {
        Alert.alert('Error', 'Please enter a valid API key');
        return;
      }

      await AsyncStorage.setItem('openai_api_key', apiKey.trim());
      setIsEditing(false);
      Alert.alert('Success', 'API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const renderApiKey = () => {
    if (!apiKey) return '••••••••';
    return isEditing ? apiKey : '•'.repeat(apiKey.length);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OpenAI API Key</Text>
        <Text style={styles.description}>
          Enter your OpenAI API key to enable transcription and content generation features.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={isEditing ? apiKey : renderApiKey()}
            onChangeText={setApiKey}
            placeholder="Enter OpenAI API Key"
            secureTextEntry={!isEditing}
            editable={isEditing}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.toggleButtonText}>
              {isEditing ? '🔒' : '✏️'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveApiKey}
          >
            <Text style={styles.saveButtonText}>Save API Key</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.footer}>
        Your API key is stored securely on your device and is only used for OpenAI API calls.
      </Text>
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
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
  toggleButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default SettingsScreen;
