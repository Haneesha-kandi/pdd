import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

const auth = getAuth(app);

export default function Home({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [facing, setFacing] = useState('front');
  const cameraRef = useRef(null);

  // Countdown effect for auto-capture
  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleTakePicture();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleScanPress = async () => {
    if (!permission?.granted) {
      Alert.alert(
        "Camera Permission",
        "This app needs access to your camera to scan your skin.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Allow",
            onPress: async () => {
              const result = await requestPermission();
              if (result.granted) {
                setCameraVisible(true);
              } else {
                Alert.alert("Permission Denied", "Camera access is required to scan.");
              }
            }
          }
        ]
      );
    } else {
      setCameraVisible(true);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setCameraVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImage(photo.uri);
        setCameraVisible(false);
        setCountdown(null);
      } catch (error) {
        Alert.alert("Error", "Failed to take picture");
        setCountdown(null);
      }
    }
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  const toggleCameraFacing = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  const handleRescan = () => {
    setImage(null);
    handleScanPress(); // Ask permission again if needed
  };

  const handleContinue = () => {
    if (image) {
      navigation.navigate('Results', { imageUri: image });
    } else {
      Alert.alert("Error", "Please scan your skin first");
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading camera permissions...</Text>
      </SafeAreaView>
    );
  }

  if (cameraVisible) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setCameraVisible(false);
                setCountdown(null);
              }}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            {countdown !== null && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.flipCameraButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={startCountdown}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#7a9c59" barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.instructionsText}>
          Use your camera to upload a photo for AI analysis
        </Text>

        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialIcons name="face" size={40} color="#ccc" />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.scanButton]}
          onPress={image ? handleRescan : handleScanPress}
        >
          <Text style={styles.buttonText}>{image ? "Rescan" : "Scan"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleUploadPhoto}>
          <Ionicons name="cloud-upload-outline" size={20} color="#333" />
          <Text style={styles.actionButtonText}>Upload Photo</Text>
        </TouchableOpacity>

        <View style={styles.instructionsPanel}>
          <Text style={styles.instructionsPanelTitle}>Instructions:</Text>
          {[
            "Ensure good lighting",
            "Remove glasses or accessories",
            "Keep face centered",
            "Maintain neutral expression"
          ].map((text, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.bulletPoint}>• </Text>
              <Text style={styles.instructionText}>{text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.continueButton]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
    paddingVertical: 12, paddingTop: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  content: { padding: 16, alignItems: 'center' },
  instructionsText: { fontSize: 14, color: '#4a90e2', textAlign: 'center', marginBottom: 16 },
  imageContainer: {
    width: '100%', height: 300, borderRadius: 8,
    overflow: 'hidden', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e0e0e0',
    marginBottom: 16, justifyContent: 'center', alignItems: 'center'
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#999', marginTop: 8 },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 16
  },
  actionButtonText: { marginLeft: 6, color: '#333', fontSize: 14 },
  button: {
    width: '100%', padding: 15, borderRadius: 8,
    alignItems: 'center', marginBottom: 16
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loadingText: { fontSize: 16, color: '#333', textAlign: 'center', margin: 20 },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', margin: 20 },
  scanButton: { backgroundColor: '#8bc34a' },
  continueButton: { backgroundColor: '#8bc34a' },
  instructionsPanel: {
    width: '100%', backgroundColor: '#e8f5e9', borderRadius: 8,
    padding: 16, marginBottom: 16
  },
  instructionsPanelTitle: { fontWeight: 'bold', marginBottom: 8, color: '#333' },
  instructionItem: { flexDirection: 'row', marginBottom: 4 },
  bulletPoint: { color: '#333' },
  instructionText: { color: '#555' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraControls: {
    flex: 1, backgroundColor: 'transparent', flexDirection: 'row',
    justifyContent: 'center', alignItems: 'flex-end', padding: 20
  },
  backButton: { position: 'absolute', top: 40, left: 20, padding: 10 },
  flipCameraButton: { position: 'absolute', top: 40, right: 20, padding: 10 },
  captureButton: {
    width: 70, height: 70, borderRadius: 35, borderWidth: 5,
    borderColor: 'white', alignItems: 'center', justifyContent: 'center',
    marginBottom: 30
  },
  captureInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'white' },
  countdownContainer: {
    position: 'absolute', top: '50%', left: 0, right: 0,
    alignItems: 'center'
  },
  countdownText: {
    fontSize: 80, fontWeight: 'bold', color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 5
  },
});
