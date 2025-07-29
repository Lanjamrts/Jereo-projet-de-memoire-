import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { styles } from "../../constants/styles";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link, useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        birthDate,
        email,
        password,
      });

      if (response.status === 201) {
        // Stocker le token
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

        Alert.alert("Succès", "Compte créé avec succès !");
        router.push("../../pages/Accueil");
      }
    } catch (error: any) {
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

        {/* Champ Date de naissance */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date de naissance</Text>
          <Input
            placeholder="JJ/MM/AAAA"
            value={birthDate}
            onChangeText={setBirthDate}
          />
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
