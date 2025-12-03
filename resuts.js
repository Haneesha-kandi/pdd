import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export default function Results({ route, navigation }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { imageUri } = route.params; // Get image URI from Home component
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  useEffect(() => {
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    setData(null);
    setError(null);
    setLoading(true);

    try {
      let fileInfo = await FileSystem.getInfoAsync(imageUri);
      let compressedUri = imageUri;

      // Compress image if larger than 2MB
      if (fileInfo.size > MAX_FILE_SIZE) {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: 'jpeg' }
        );
        compressedUri = manipulatedImage.uri;
        fileInfo = await FileSystem.getInfoAsync(compressedUri);

        if (fileInfo.size > MAX_FILE_SIZE) {
          throw new Error('Image could not be compressed below 2MB');
        }
      }

      const formData = new FormData();
      formData.append('image', {
        uri: compressedUri,
        type: 'image/jpeg',
        name: 'skin-image.jpg',
      });

      const response = await fetch(
        'https://skin-analyze.p.rapidapi.com/facebody/analysis/skinanalyze',
        {
          method: 'POST',
          headers: {
            'x-rapidapi-host': 'skin-analyze.p.rapidapi.com',
            'x-rapidapi-key': 'a50eab48ecmsh3c0e481520a2a01p137ce3jsne8009954a821',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!data || !data.result) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultHeader}>🔍 Skin Analysis</Text>
        {Object.entries(data.result).map(([key, value], index) => {
          if (key === 'skin_type') {
            const typeMap = ['Oily', 'Dry', 'Combination', 'Normal'];
            const detected = value.skin_type;
            return (
              <View key={index} style={styles.resultBox}>
                <Text style={styles.label}>Skin Type:</Text>
                <Text style={styles.value}>{typeMap[detected] || 'Unknown'}</Text>
              </View>
            );
          }

          if (typeof value === 'object' && 'confidence' in value) {
            const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const displayValue =
              value.value === 0
                ? 'Not Detected ❌'
                : value.value === 1
                ? 'Detected ✅'
                : `Detected (Level: ${value.value})`;

            return (
              <View key={index} style={styles.resultBox}>
                <Text style={styles.label}>{displayName}:</Text>
                <Text style={styles.value}>{displayValue}</Text>
              </View>
            );
          }
          return null;
        })}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧴 Skin Analysis Results</Text>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.imagePreview}
        />
      )}

      {loading && <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 20 }} />}

      {error && <Text style={styles.error}>Error: {error}</Text>}

      {renderResults()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FB',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  resultContainer: {
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
  },
  resultHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6C63FF',
  },
  resultBox: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#444',
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    color: '#333',
  },
  error: {
    color: 'red',
    marginTop: 15,
    fontSize: 16,
  },
});
