import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // adjust if needed
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const navigation = useNavigation();
  const [userCount, setUserCount] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout Error', 'Failed to log out: ' + error.message);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: handleLogout, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  // Set logout icon in header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={confirmLogout} style={{ marginRight: 15 }}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Fetch counts from Firestore
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const productsSnapshot = await getDocs(collection(db, 'products'));

        setUserCount(usersSnapshot.size);
        setProductCount(productsSnapshot.size);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7a9c59" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Admin </Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total Users</Text>
        <Text style={styles.cardValue}>{userCount}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total Products</Text>
        <Text style={styles.cardValue}>{productCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7a9c59',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
});
