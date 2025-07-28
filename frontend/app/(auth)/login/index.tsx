import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "../../constants/styles";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link } from "expo-router";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mail</Text>
        <Input 
          placeholder="Votre mail" 
          value={email}
          onChangeText={setEmail}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mot de passe :</Text>
        <Input 
          placeholder="Votre mot de passe" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <Link href="../pages/Accueil" asChild>
        <Button 
          title="Se connecter" 
          onPress={() => console.log("Connexion attempt", { email, password })}
        />
      </Link>
      
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

      
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Pas encore de compte ? </Text>
        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Inscription</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <TouchableOpacity style={styles.forgotPasswordContainer}>
        <Text style={styles.linkText}>Mot de passe oublié?</Text>
      </TouchableOpacity>
    </View>
  );
}