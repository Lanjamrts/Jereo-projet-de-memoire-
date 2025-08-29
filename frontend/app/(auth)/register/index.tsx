import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Platform } from "react-native";
import { styles } from "../../constants/styles";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link, useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

// Définir un type pour l'image
type ImageInfo = {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
};

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // États pour le DatePicker
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthDate, setBirthDate] = useState("");

  // État pour l'image de profil
  const [profileImage, setProfileImage] = useState<ImageInfo | null>(null);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();

  // Fonction pour sélectionner une image depuis la galerie
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage({
        uri: result.assets[0].uri,
        type: result.assets[0].type,
        width: result.assets[0].width,
        height: result.assets[0].height
      });
    }
  };

  // Fonction pour prendre une photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de la permission de la caméra pour prendre une photo.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage({
        uri: result.assets[0].uri,
        type: result.assets[0].type,
        width: result.assets[0].width,
        height: result.assets[0].height
      });
    }
  };

  // Fonction d'inscription
  const handleRegister = async () => {
    if (!firstName || !lastName || !birthDate || !email || !password || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setUploading(true);
      
      // Créer un FormData pour envoyer les données
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('birthDate', birthDate);
      formData.append('email', email);
      formData.append('password', password);
      
      // Ajouter l'image si elle existe
      if (profileImage) {
        // Extraire l'extension du fichier
        const uriParts = profileImage.uri.split('.');
        const fileExtension = uriParts[uriParts.length - 1];
        
        // Générer un nom de fichier unique
        const fileName = `profile-${Date.now()}.${fileExtension}`;
        
        formData.append('profilePicture', {
          uri: profileImage.uri,
          name: fileName,
          type: `image/${fileExtension}`,
        } as any);
      }

      const response = await axios.post(`${API_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Réponse complète:", response.data);

      if (response.status === 201) {
        Alert.alert("Succès", "Compte créé avec succès !");
        router.push("/login");
      }
    } catch (error: any) {
      console.error("Erreur détaillée:", error.response?.data);
      Alert.alert("Erreur", error.response?.data?.message || "Impossible de créer le compte");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Titre fixe */}
      <Text style={[styles.title, { marginTop: 40, marginBottom: 15 }]}>Inscription</Text>
      
      {/* ScrollView pour les champs */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Photo de profil */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Photo de profil (optionnel)</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
            <TouchableOpacity 
              style={[styles.button, { padding: 10, margin: 5 }]}
              onPress={pickImage}
            >
              <Text style={styles.buttonText}>Choisir une photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { padding: 10, margin: 5 }]}
              onPress={takePhoto}
            >
              <Text style={styles.buttonText}>Prendre une photo</Text>
            </TouchableOpacity>
          </View>
          
          {profileImage && (
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <Image 
                source={{ uri: profileImage.uri }} 
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
              <TouchableOpacity 
                onPress={() => setProfileImage(null)}
                style={{ marginTop: 5 }}
              >
                <Text style={{ color: 'red' }}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Champ Nom */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nom :</Text>
          <Input
            placeholder="Votre nom"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* Champ Prénom */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Prénom :</Text>
          <Input
            placeholder="Votre prénom"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        {/* Champ Date de naissance avec DatePicker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date de naissance</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 15,
              backgroundColor: '#fff'
            }}
          >
            <Text style={{ color: birthDate ? '#000' : '#999' }}>
              {birthDate ? new Date(birthDate).toLocaleDateString('fr-FR') : "Sélectionner une date"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                  // Format AAAA-MM-JJ pour l'API
                  const formattedDate = selectedDate.toISOString().split('T')[0];
                  setBirthDate(formattedDate);
                }
              }}
            />
          )}
        </View>

        {/* Champ Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mail</Text>
          <Input
            placeholder="Votre mail"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Champ Mot de passe */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe :</Text>
          <Input
            placeholder="Votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Champ Confirmation mot de passe */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmé mot de passe</Text>
          <Input
            placeholder="Confirmer votre mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Bouton Inscription */}
        <TouchableOpacity 
          onPress={uploading ? undefined : handleRegister}
          style={[styles.button, uploading && { opacity: 0.5 }]}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>
            {uploading ? "Inscription en cours..." : "S'inscrire"}
          </Text>
        </TouchableOpacity>

        {/* Connexion Google (non reliée) */}
        <TouchableOpacity
          style={[styles.button, styles.googleButton, { flexDirection: "row", alignItems: "center", justifyContent: "center" }]}
          onPress={() => console.log("Google login")}
        >
          <Image
            source={require("../../../assets/icons/google.png")}
            style={{ width: 20, height: 20, marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Un compte Google</Text>
        </TouchableOpacity>

        {/* Lien vers Connexion */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Tu as déjà un compte ? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Connexion</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}