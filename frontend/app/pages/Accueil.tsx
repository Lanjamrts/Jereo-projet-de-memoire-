import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from "react-native-maps";
import { API_URL, BASE_URL } from "../constants/api";

const Accueil = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [signalements, setSignalements] = useState<any[]>([]);
  const [filteredSignalements, setFilteredSignalements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("Tous");

  // Récupérer le token et user
  useEffect(() => {
    const fetchSignalements = async () => {
      try {
        const res = await fetch(`${API_URL}/signaler`);
        if (!res.ok) throw new Error("Erreur lors du chargement des signalements");

        const data = await res.json();

        // Trier du plus récent au plus ancien
        const sortedData = data.sort(
          (a: any, b: any) =>
            new Date(b.dateSignalement).getTime() - new Date(a.dateSignalement).getTime()
        );

        setSignalements(sortedData);
        setFilteredSignalements(sortedData); // Par défaut : tous
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les signalements");
      } finally {
        setLoading(false);
      }
    };
    fetchSignalements();
  }, []);


  // Charger les signalements
  useEffect(() => {
    const fetchSignalements = async () => {
      try {
        const res = await fetch(`${API_URL}/signaler`);
        if (!res.ok) throw new Error("Erreur lors du chargement des signalements");

        const data = await res.json();
        setSignalements(data);
        setFilteredSignalements(data); // Par défaut : tous
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les signalements");
      } finally {
        setLoading(false);
      }
    };
    fetchSignalements();
  }, []);

  // Appliquer les filtres
  const applyFilter = (status: string) => {
    setSelectedFilter(status);
    if (status === "Tous") {
      setFilteredSignalements(signalements);
    } else if (status === "En cours") {
      setFilteredSignalements(signalements.filter((s) => s.status === "En attente"));
    } else {
      setFilteredSignalements(signalements.filter((s) => s.status === status));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />

      {/* Marque de bienvenue */}
      {/* <View style={styles.welcomeBox}>
        <Text style={styles.welcomeTitle}>Bienvenue sur Jereo !</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.welcomeSubtitle}>
          Token : {token ? "Connecté" : "Pas connecté"}
        </Text>
      </View> */}

      {/* Filtres */}
      <View style={styles.filters}>
        {["Tous", "En cours", "Pris en charge", "Resolu"].map((label, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              selectedFilter === label && { backgroundColor: "#8B0000" },
            ]}
            onPress={() => applyFilter(label)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === label && { color: "#fff" },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenu principal */}
      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#8B0000"
            style={{ marginTop: 30 }}
          />
        ) : filteredSignalements.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Aucun signalement trouvé
          </Text>
        ) : (
          filteredSignalements.map((signalement) => (
            <View key={signalement._id} style={styles.postCard}>
              {/* En-tête utilisateur */}
              <View style={styles.userRow}>
                <Image
                  source={require("../../assets/profiles/kevinfal.jpg")}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.username}>{signalement.nomSignaleur}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(signalement.dateSignalement).toLocaleDateString()}
                  </Text>
                </View>

                {/* Badge statut */}
                <View
                  style={[
                    styles.statusBadgeYellow,
                    signalement.status === "Pris en charge" && {
                      backgroundColor: "#ffeb3b",
                    },
                    signalement.status === "Resolu" && { backgroundColor: "#4caf50" },
                    signalement.status === "En attente" && { backgroundColor: "#f44336" },
                  ]}
                >
                  <Text style={styles.statusText}>{signalement.status}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.description}>{signalement.description}</Text>

              {/* Image du signalement */}
              <Image
                source={{ uri: `${BASE_URL}${signalement.imageUrl}` }}
                style={styles.reportImage}
              />

              {/* Carte dynamique */}
              <Text style={styles.mapLabel}>Localisation :</Text>
              <MapView
                style={styles.mapImage}
                initialRegion={{
                  latitude: signalement.lieux.latitude,
                  longitude: signalement.lieux.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
              >
                <Marker
                  coordinate={{
                    latitude: signalement.lieux.latitude,
                    longitude: signalement.lieux.longitude,
                  }}
                  title="Incident"
                  description={signalement.description}
                />
              </MapView>
            </View>
          ))
        )}
      </ScrollView>

      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeBox: {
    backgroundColor: "#fff",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B0000",
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 4,
    color: "#444",
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "gray",
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterText: {
    color: "#8B0000",
  },
  content: {
    backgroundColor: "#f6f6f6",
  },
  postCard: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  username: {
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
  statusBadgeYellow: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: "auto",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  description: {
    marginVertical: 10,
  },
  reportImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  mapLabel: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#8B0000",
  },
  mapImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
});

export default Accueil;
