import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { styles } from "../../constants/styles";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { Link } from "expo-router";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <View style={styles.container}>
      
      {/* Titre fixe */}
      <Text style={[styles.title, {marginTop: 40, marginBottom: 15}]}>Inscription</Text>   

      {/* ScrollView pour les champs uniquement */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nom :</Text>
          <Input 
            placeholder="Votre nom" 
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Prénom :</Text>
          <Input 
            placeholder="Votre prénom" 
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date de naissance</Text>
          <Input 
            placeholder="JJ/MM/AA" 
            value={birthDate}
            onChangeText={setBirthDate}
          />
        </View>
        
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
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmé mot de passe</Text>
          <Input 
            placeholder="Confirmer votre mot de passe" 
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        <Link href="../pages/Accueil" asChild>
          <Button 
            title="S'inscrire" 
            onPress={() => console.log("Inscription attempt", { 
              firstName, lastName, birthDate, email, password 
            })}
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
