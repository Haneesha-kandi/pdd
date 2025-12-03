// Login.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  let [fontsLoaded] = useFonts({ Inter_400Regular });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check if admin user
        const isAdmin = user.email === 'admin@gmail.com';
        navigation.replace('Main', { isAdmin });
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = email === 'admin@gmail.com';
      setLoading(false);
      navigation.replace('Main', { isAdmin });
    } catch (error) {
      setLoading(false);
      let errorMessage = 'Login failed. Please check your credentials.';
      // Error handling remains the same
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later';
      }
      Alert.alert('Login Error', errorMessage);
    }
  };

  if (!fontsLoaded || loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#7a9c59" /></View>;
  }

  return (
    // Rest of the JSX remains the same
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SS</Text>
        </View>
        <Text style={styles.title}>SkinSync</Text>
        <Text style={styles.subtitle}>Your daily skincare companion</Text>
      </View>

      <TextInput 
        style={styles.input} 
        placeholder="Email address" 
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signUpContainer} onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signUpText}>
          Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#c3d69b', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  subtitle: { fontSize: 14, color: 'gray' },
  input: { width: '80%', padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10, borderColor: 'gray' },
  forgotPassword: { alignSelf: 'flex-end', marginRight: '10%', marginTop: 5 },
  forgotText: { color: 'gray' },
  loginButton: { backgroundColor: '#7a9c59', padding: 15, borderRadius: 5, marginTop: 20, width: '80%', alignItems: 'center' },
  loginText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  signUpContainer: { marginTop: 20 },
  signUpText: { color: 'gray' },
  signUpLink: { color: '#7a9c59', fontWeight: 'bold' }
};
