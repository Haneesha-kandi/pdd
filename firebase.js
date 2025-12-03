import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyA0zOG-gp4EaHMlg0decgTDy3x4cz1o--M",
    authDomain: "skin-sink.firebaseapp.com",
    projectId: "skin-sink",
    storageBucket: "skin-sink.firebasestorage.app",
    messagingSenderId: "366451298115",
    appId: "1:366451298115:web:e769a1363ba888520ea9f6",
    measurementId: "G-CJGSKJ2ND8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export { db, storage, auth };
