// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   TextInput,
// } from 'react-native';
// import Header from '../components/Header';
// import Navbar from '../components/Navbar';
// import { Picker } from '@react-native-picker/picker';

// const Signalement = () => {
//   const [selectedService, setSelectedService] = useState('Pompier');

//   return (
//     <View style={{ flex: 1 }}>
//       <Header />

//       <View style={styles.container}>
//         <Image
//           source={require('../../assets/carte/carte.png')}
//           style={styles.mapImage}
//         />

//         <TouchableOpacity style={styles.photoButton} disabled={true}>
//           <Text style={styles.photoButtonText}>+ Prendre une photo</Text>
//         </TouchableOpacity>

//         <View style={styles.dropdownContainer}>
//           <Picker
//             selectedValue={selectedService}
//             onValueChange={(itemValue) => setSelectedService(itemValue)}
//             style={styles.picker}
//           >
//             <Picker.Item label="Pompier" value="Pompier" />
//             <Picker.Item label="Police" value="Police" />
//             <Picker.Item label="Ambulance" value="Ambulance" />
//           </Picker>
//         </View>

//         <TextInput
//           style={styles.description}
//           multiline
//           placeholder="Description....."
//         />

//         <TouchableOpacity style={styles.reportButton}>
//           <Image
//             source={require('../../assets/icons/logo jereo.png')}
//             style={styles.reportIcon}
//           />
//           <Text style={styles.reportButtonText}>Signaler</Text>
//         </TouchableOpacity>

//       </View>

//       <Navbar />
//     </View>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: '#fff',
//   },
//   mapImage: {
//     width: '100%',
//     height: 220,
//     borderRadius: 12,
//     marginBottom: 15,
//   },
//   photoButton: {
//     backgroundColor: '#f5f5f5',
//     borderRadius: 10,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   photoButtonText: {
//     color: '#555',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   dropdownContainer: {
//     borderWidth: 1,
//     borderColor: '#8B0000',
//     borderRadius: 8,
//     marginBottom: 15,
//     overflow: 'hidden',
//     backgroundColor: '#fff',
//   },
//   picker: {
//     height: 50,
//     width: '100%',
//     color: '#8B0000',
//     fontSize: 16,
//   },
//   description: {
//     height: 110,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     textAlignVertical: 'top',
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginBottom: 15,
//     fontSize: 15,
//     color: '#333',
//     backgroundColor: '#fdfdfd',
//   },
//   reportIcon: {
//     width: 26,
//     height: 26,
//     marginRight: 8,
//   },
//   reportButton: {
//     backgroundColor: '#8B0000',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   reportButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });


// export default Signalement;




import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { API_URL } from "../constants/api";

export default function Signalement() {
  const [selectedService, setSelectedService] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [autorites, setAutorites] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Récupérer infos user depuis AsyncStorage
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserEmail(parsedUser.email);
        setUserName(`${parsedUser.firstName} ${parsedUser.lastName}`);
      }
    };
    fetchUser();
  }, []);

  // Charger la liste des autorités depuis le backend
  useEffect(() => {
    fetch(`${API_URL}/autorites`)
      .then((res) => res.json())
      .then((data) => {
        setAutorites(data);
        if (data.length > 0) setSelectedService(data[0]._id);
      })
      .catch(() => Alert.alert("Erreur", "Impossible de charger les autorités"));
  }, []);

  // Obtenir la position actuelle
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Autorisez la localisation.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // Choisir une image avec la galerie ou l'appareil photo
  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Soumettre le signalement
  const handleSubmit = async () => {
    if (!description || !selectedService || !location || !image) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs et prendre une photo");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("description", description);
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());
      formData.append("autoriteId", selectedService);
      formData.append("emailSignaleur", userEmail);
      formData.append("nomSignaleur", userName);

      // Image
      formData.append("image", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${API_URL}/signaler`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) throw new Error("Erreur lors de l'envoi");
      Alert.alert("Succès", "Signalement envoyé !");
      setDescription("");
      setImage(null);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'envoyer le signalement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />

      <View style={styles.container}>
        {/* Carte avec localisation */}
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={location} title="Votre position" />
          </MapView>
        ) : (
          <ActivityIndicator size="large" color="#8B0000" style={{ marginVertical: 20 }} />
        )}

        {/* Bouton photo */}
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>
            {image ? "Photo prise ✔" : "+ Prendre une photo"}
          </Text>
        </TouchableOpacity>

        {/* Dropdown des autorités */}
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedService}
            onValueChange={(itemValue) => setSelectedService(itemValue)}
            style={styles.picker}
          >
            {autorites.map((a) => (
              <Picker.Item key={a._id} label={a.nom} value={a._id} />
            ))}
          </Picker>
        </View>

        {/* Description */}
        <TextInput
          style={styles.description}
          multiline
          placeholder="Description....."
          value={description}
          onChangeText={setDescription}
        />

        {/* Bouton signaler */}
        <TouchableOpacity style={styles.reportButton} onPress={handleSubmit} disabled={loading}>
          <Image
            source={require("../../assets/icons/logo jereo.png")}
            style={styles.reportIcon}
          />
          <Text style={styles.reportButtonText}>
            {loading ? "Envoi..." : "Signaler"}
          </Text>
        </TouchableOpacity>
      </View>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  map: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 15,
  },
  photoButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  photoButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#8B0000",
    fontSize: 16,
  },
  description: {
    height: 110,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    textAlignVertical: "top",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#fdfdfd",
  },
  reportIcon: {
    width: 26,
    height: 26,
    marginRight: 8,
  },
  reportButton: {
    backgroundColor: "#8B0000",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
