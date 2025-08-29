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

  const router = useRouter();

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
      const response = await axios.post(`${API_URL}/auth/register`, {
        firstName,
        lastName,
        birthDate, // Déjà au format AAAA-MM-JJ
        email,
        password,
      });

      console.log("Réponse complète:", response.data);

      if (response.status === 201) {
        Alert.alert("Succès", "Compte créé avec succès !");
        router.push("/login");
      }
    } catch (error: any) {
      console.error("Erreur détaillée:", error.response?.data);
      Alert.alert("Erreur", error.response?.data?.message || "Impossible de créer le compte");
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
        <Button title="S'inscrire" onPress={handleRegister} />

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