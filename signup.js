import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../firebase'; // Ensure you have firebaseConfig.js set up

const auth = getAuth(app);
const db = getFirestore(app);

export default function Signup({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        uid: user.uid,
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SS</Text>
        </View>
        <Text style={styles.title}>Your Personalized AI Skincare Journey Starts Here</Text>
      </View>

      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Email Address" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      
      <TouchableOpacity style={styles.getStartedButton} onPress={handleSignup}>
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account? <Text style={styles.linkText}>Log in</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#c3d69b', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  input: { width: '100%', padding: 10, borderWidth: 1, borderRadius: 5, marginTop: 10, borderColor: 'gray' },
  getStartedButton: { backgroundColor: '#7a9c59', padding: 15, borderRadius: 5, marginTop: 20, width: '100%', alignItems: 'center' },
  getStartedText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#7a9c59', fontWeight: 'bold' },
  loginText: { color: 'gray', marginTop: 10 }
};
