import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import MapView, { Marker } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, BASE_URL } from "../constants/api";

interface Signalement {
  _id: string;
  lieux: { latitude: number; longitude: number };
  description: string;
  imageUrl: string;
  status: string;
  emailSignaleur: string;
  nomSignaleur: string;
  autoriteId: any;
  dateSignalement: string;
}

const HistoryScreen = () => {
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Récupérer email de l'utilisateur connecté
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserEmail(parsedUser.email);

          // 2. Récupérer tous les signalements
          const res = await fetch(`${API_URL}/signaler`);
          const data = await res.json();

          // 3. Filtrer par email
          const filtered = data
            .filter((sig: Signalement) => sig.emailSignaleur === parsedUser.email)
            .sort(
              (a: Signalement, b: Signalement) =>
                new Date(b.dateSignalement).getTime() - new Date(a.dateSignalement).getTime()
          );

          setSignalements(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Couleur du badge selon status
  const getBadgeColor = (status: string) => {
    switch (status) {
      case "En attente":
        return "#f44336"; // rouge
      case "Pris en charge":
        return "#ffeb3b"; // jaune
      case "Resolu":
        return "#4caf50"; // vert
      default:
        return "#ccc";
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header />

      <Text style={styles.title}>Historique de mes signalements</Text>

      <ScrollView style={styles.scroll}>
        {signalements.length === 0 ? (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            Aucun signalement trouvé
          </Text>
        ) : (
          signalements.map((report) => (
            <View key={report._id} style={styles.card}>
              {/* Ligne avec image et carte */}
              <View style={styles.row}>
                {/* Image du signalement */}
                <Image
                  source={{ uri: `${BASE_URL}${report.imageUrl}` }}
                  style={styles.image}
                />

                {/* Carte Map */}
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: report.lieux.latitude,
                    longitude: report.lieux.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: report.lieux.latitude,
                      longitude: report.lieux.longitude,
                    }}
                    title="Incident"
                  />
                </MapView>
              </View>

              {/* Date ou temps (simplifié ici) */}
              <Text style={styles.time}>
                {new Date(report.dateSignalement).toLocaleDateString()}
              </Text>

              {/* Badge status */}
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getBadgeColor(report.status) },
                ]}
              >
                <Text style={styles.badgeText}>{report.status}</Text>
              </View>

              {/* Autorité et description */}
              <Text style={styles.label}>
                Autorité signalée :{" "}
                <Text style={styles.bold}>
                  {report.autoriteId?.nom || "Non spécifié"}
                </Text>
              </Text>
              <Text style={styles.desc}>{report.description}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    padding: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B0000",
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  image: {
    width: "48%",
    height: 100,
    borderRadius: 8,
  },
  map: {
    width: "48%",
    height: 100,
    borderRadius: 8,
  },
  time: {
    marginTop: 5,
    fontSize: 12,
    color: "gray",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
  },
  badgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
    color: "#8B0000",
  },
  desc: {
    fontSize: 13,
    marginTop: 5,
    color: "#555",
  },
});

export default HistoryScreen;
