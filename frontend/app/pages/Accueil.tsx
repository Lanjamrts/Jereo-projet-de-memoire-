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
import { API_URL, BASE_URL } from "../constants/api";
import { WebView } from "react-native-webview";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  email: string;
}

interface Signalement {
  _id: string;
  lieux: {
    latitude: number;
    longitude: number;
  };
  description: string;
  imageUrl: string;
  status: string;
  dateSignalement: string;
  emailSignaleur: string;
  nomSignaleur: string;
  autoriteId: string;
  user?: UserProfile;
}

const Accueil = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [filteredSignalements, setFilteredSignalements] = useState<
    Signalement[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("Tous");
  const [userProfiles, setUserProfiles] = useState<{
    [key: string]: UserProfile;
  }>({});

  // Récupérer le token et user
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      setToken(storedToken);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserName(`${parsedUser.firstName} ${parsedUser.lastName}`);
      }
    };
    fetchToken();
  }, []);

  // Fonction pour récupérer le profil d'un utilisateur par email
  const fetchUserProfile = async (
    email: string
  ): Promise<UserProfile | null> => {
    try {
      // Vérifier si on a déjà le profil en cache
      if (userProfiles[email]) {
        return userProfiles[email];
      }

      const res = await fetch(`${API_URL}/auth/profile-by-email/${email}`);
      if (res.ok) {
        const profile = await res.json();
        setUserProfiles((prev) => ({ ...prev, [email]: profile }));
        return profile;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      return null;
    }
  };

  // Charger les signalements avec les profils utilisateurs
  useEffect(() => {
    const fetchSignalements = async () => {
      try {
        const res = await fetch(`${API_URL}/signaler`);
        if (!res.ok) {
          throw new Error("Erreur lors du chargement des signalements");
        }

        const data: Signalement[] = await res.json();
        setSignalements(data);
        setFilteredSignalements(data);

        // Récupérer les profils pour chaque signalement
        const uniqueEmails = Array.from(
          new Set(data.map((s) => s.emailSignaleur))
        );

        for (const email of uniqueEmails) {
          await fetchUserProfile(email);
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger les signalements");
        console.error(error);
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
      setFilteredSignalements(
        signalements.filter((s) => s.status === "En attente")
      );
    } else {
      setFilteredSignalements(signalements.filter((s) => s.status === status));
    }
  };

  // Fonction pour obtenir l'URI de l'image de profil
  // Fonction pour obtenir l'URI de l'image de profil
  const getProfileImageSource = (signalement: Signalement) => {
    const userProfile = userProfiles[signalement.emailSignaleur];

    if (userProfile?.profilePicture) {
      // Ajouter systématiquement le slash au début
      const imagePath = userProfile.profilePicture.startsWith("/")
        ? userProfile.profilePicture
        : `/${userProfile.profilePicture}`;

      return { uri: `${BASE_URL}${imagePath}` };
    }

    // Image par défaut si pas de photo de profil
    return require("../../assets/profiles/default-avatar.png");
  };

  // Fonction pour obtenir le nom complet de l'utilisateur
  const getDisplayName = (signalement: Signalement) => {
    const userProfile = userProfiles[signalement.emailSignaleur];

    if (userProfile) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }

    // Fallback au nom stocké dans le signalement
    return signalement.nomSignaleur;
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />

      {/* Filtres */}
      <View style={styles.filters}>
        {["Tous", "En cours", "Pris en charge", "Resolu"].map(
          (label, index) => (
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
          )
        )}
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
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            Aucun signalement trouvé
          </Text>
        ) : (
          filteredSignalements.map((signalement) => (
            <View key={signalement._id} style={styles.postCard}>
              {/* En-tête utilisateur */}
              <View style={styles.userRow}>
                <Image
                  source={getProfileImageSource(signalement)}
                  style={styles.avatar}
                  onError={() =>
                    console.log("Erreur de chargement de l'avatar")
                  }
                />
                <View style={styles.userInfo}>
                  <Text style={styles.username}>
                    {getDisplayName(signalement)}
                  </Text>
                  <Text style={styles.timestamp}>
                    {new Date(signalement.dateSignalement).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                </View>

                {/* Badge statut */}
                <View
                  style={[
                    styles.statusBadge,
                    signalement.status === "Pris en charge" && {
                      backgroundColor: "#ffeb3b",
                    },
                    signalement.status === "Resolu" && {
                      backgroundColor: "#4caf50",
                    },
                    signalement.status === "En attente" && {
                      backgroundColor: "#f44336",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{signalement.status}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.description}>{signalement.description}</Text>

              {/* Image du signalement */}
              {signalement.imageUrl && (
                <Image
                  source={{ uri: `${BASE_URL}${signalement.imageUrl}` }}
                  style={styles.reportImage}
                  resizeMode="cover"
                />
              )}

              {/* Carte dynamique */}
              <Text style={styles.mapLabel}>Localisation :</Text>
              <View style={styles.mapContainer}>
                <WebView
                  style={styles.mapImage}
                  originWhitelist={["*"]}
                  source={{
                    html: `
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
                        </head>
                        <body>
                          <div id="map" style="width:100%;height:100%;"></div>
                          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
                          <script>
                            var map = L.map('map').setView([${
                              signalement.lieux.latitude
                            }, ${signalement.lieux.longitude}], 16);
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                              maxZoom: 19,
                            }).addTo(map);
                            L.marker([${signalement.lieux.latitude}, ${
                      signalement.lieux.longitude
                    }]).addTo(map)
                              .bindPopup('${signalement.description.replace(
                                /'/g,
                                "\\'"
                              )}')
                              .openPopup();
                          </script>
                        </body>
                      </html>
                    `,
                  }}
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterButton: {
    borderWidth: 1,
    borderColor: "#8B0000",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
    alignItems: "center",
  },
  filterText: {
    color: "#8B0000",
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    backgroundColor: "#f6f6f6",
    flex: 1,
  },
  postCard: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  userInfo: {
    flex: 1,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#e0e0e0",
  },
  username: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
  },
  description: {
    marginVertical: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },
  reportImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  mapLabel: {
    marginTop: 15,
    marginBottom: 8,
    fontWeight: "bold",
    color: "#8B0000",
    fontSize: 14,
  },
  mapContainer: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
});

export default Accueil;
