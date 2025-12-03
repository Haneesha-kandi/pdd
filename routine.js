import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native'; // Add this import

const Routine = () => {
  const [morningRoutine, setMorningRoutine] = useState([]);
  const [eveningRoutine, setEveningRoutine] = useState([]);

  const loadRoutine = async () => {
    try {
      const storedRoutine = await AsyncStorage.getItem('routine');
      if (storedRoutine) {
        const routineArray = JSON.parse(storedRoutine);
        setMorningRoutine(routineArray.filter(item => item.time === 'morning'));
        setEveningRoutine(routineArray.filter(item => item.time === 'evening'));
      }
    } catch (error) {
      console.error('Error loading routine:', error);
    }
  };

  // Load routine every time screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRoutine();
    }, [])
  );

  const toggleStep = async (routineType, id) => {
    let updatedRoutine;
    if (routineType === 'morning') {
      updatedRoutine = morningRoutine.map(step =>
        step.id === id ? { ...step, completed: !step.completed } : step
      );
      setMorningRoutine(updatedRoutine);
    } else {
      updatedRoutine = eveningRoutine.map(step =>
        step.id === id ? { ...step, completed: !step.completed } : step
      );
      setEveningRoutine(updatedRoutine);
    }

    const storedRoutine = await AsyncStorage.getItem('routine');
    const routineArray = JSON.parse(storedRoutine) || [];
    const updatedFullRoutine = routineArray.map(item =>
      item.id === id && item.time === routineType
        ? { ...item, completed: !item.completed }
        : item
    );
    await AsyncStorage.setItem('routine', JSON.stringify(updatedFullRoutine));
  };

  const deleteStep = async (routineType, id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this item from your routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            let updatedRoutine;
            if (routineType === 'morning') {
              updatedRoutine = morningRoutine.filter(step => step.id !== id);
              setMorningRoutine(updatedRoutine);
            } else {
              updatedRoutine = eveningRoutine.filter(step => step.id !== id);
              setEveningRoutine(updatedRoutine);
            }

            const storedRoutine = await AsyncStorage.getItem('routine');
            const routineArray = JSON.parse(storedRoutine) || [];
            const updatedFullRoutine = routineArray.filter(item =>
              !(item.id === id && item.time === routineType)
            );
            await AsyncStorage.setItem('routine', JSON.stringify(updatedFullRoutine));
          },
        },
      ]
    );
  };

  const renderRoutineItem = ({ item, routineType }) => (
    <View style={styles.routineItem}>
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={() => toggleStep(routineType, item.id)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => console.log(`Failed to load image for ${item.name}`)}
        />
        <View style={styles.detailsContainer}>
          <Text style={[
            styles.routineText,
            { textDecorationLine: item.completed ? 'line-through' : 'none' }
          ]}>
            {item.name}
          </Text>
          <Text style={styles.detailText}>Price: ₹{item.price}</Text>
          <Text style={styles.detailText}>Frequency: {item.frequency}</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteStep(routineType, item.id)}
      >
        <Ionicons name="trash-outline" size={24} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Morning</Text>
        <FlatList
          data={morningRoutine}
          renderItem={({ item }) => renderRoutineItem({ item, routineType: 'morning' })}
          keyExtractor={item => `${item.id}-morning`}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No morning routine items</Text>}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evening</Text>
        <FlatList
          data={eveningRoutine}
          renderItem={({ item }) => renderRoutineItem({ item, routineType: 'evening' })}
          keyExtractor={item => `${item.id}-evening`}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No evening routine items</Text>}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
  },
  routineText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deleteButton: {
    padding: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Routine;
