import { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { styles } from "../../constants/styles";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link, useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Fonction de connexion
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      if (response.status === 200) {
        // Stocker le token dans AsyncStorage
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

        Alert.alert("Bienvenue", `Bonjour ${response.data.user.firstName}`);
        router.push("../../pages/Accueil");
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.message || "Identifiants incorrects");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      
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
      
      {/* Bouton Connexion */}
      <Button title="Se connecter" onPress={handleLogin} />
      
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

      {/* Lien vers inscription */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Pas encore de compte ? </Text>
        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Inscription</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Mot de passe oublié */}
      <TouchableOpacity style={styles.forgotPasswordContainer}>
        <Text style={styles.linkText}>Mot de passe oublié?</Text>
      </TouchableOpacity>
    </View>
  );
}
