
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to load profile data');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Success', 'Logged out successfully');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#7a9c59" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.title}>Your Profile</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.info}>{userData.fullName || 'Not set'}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.info}>{userData.email || 'Not set'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 20 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#c3d69b', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { 
    fontSize: 36, 
    color: 'white', 
    fontWeight: 'bold' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginTop: 15, 
    textAlign: 'center',
    color: '#333' 
  },
  infoContainer: { 
    width: '100%', 
    marginBottom: 30 
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: 'gray', 
    marginTop: 15 
  },
  info: { 
    fontSize: 18, 
    color: '#333', 
    padding: 10, 
    borderWidth: 1, 
    borderRadius: 5, 
    borderColor: '#ddd', 
    backgroundColor: '#f9f9f9' 
  },
  logoutButton: { 
    backgroundColor: '#7a9c59', 
    padding: 15, 
    borderRadius: 5, 
    width: '100%', 
    alignItems: 'center',
    marginTop: 20 
  },
  logoutText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
