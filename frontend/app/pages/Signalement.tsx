import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { Picker } from '@react-native-picker/picker';

const Signalement = () => {
  const [selectedService, setSelectedService] = useState('Pompier');

  return (
    <View style={{ flex: 1 }}>
      <Header />

      <View style={styles.container}>
        <Image
          source={require('../../assets/carte/carte.png')}
          style={styles.mapImage}
        />

        <TouchableOpacity style={styles.photoButton} disabled={true}>
          <Text style={styles.photoButtonText}>+ Prendre une photo</Text>
        </TouchableOpacity>

        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedService}
            onValueChange={(itemValue) => setSelectedService(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Pompier" value="Pompier" />
            <Picker.Item label="Police" value="Police" />
            <Picker.Item label="Ambulance" value="Ambulance" />
          </Picker>
        </View>

        <TextInput
          style={styles.description}
          multiline
          placeholder="Description....."
        />

        <TouchableOpacity style={styles.reportButton}>
          <Image
            source={require('../../assets/icons/logo jereo.png')} // remplace par ton chemin exact
            style={styles.reportIcon}
          />
          <Text style={styles.reportButtonText}>Signaler</Text>
        </TouchableOpacity>

      </View>

      <Navbar />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  mapImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 15,
  },
  photoButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#8B0000',
    fontSize: 16,
  },
  description: {
    height: 110,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    textAlignVertical: 'top',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fdfdfd',
  },
  reportIcon: {
    width: 26,
    height: 26,
    marginRight: 8,
  },
  reportButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


export default Signalement;
