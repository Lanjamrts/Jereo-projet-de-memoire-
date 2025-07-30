  import React, { useEffect, useState } from 'react';
  import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
  import Header from '../components/Header';
  import Navbar from '../components/Navbar';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  const Accueil = () => {
    const [token, setToken] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");

    // Récupérer le token au montage du composant
    useEffect(() => {
      const fetchToken = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        setToken(storedToken);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserName(`${parsedUser.firstName} ${parsedUser.lastName}`);
        }
      };
      fetchToken();
    }, []);

    return (
      <View style={{ flex: 1 }}>
        <Header />

        {/* Marque de bienvenue */}
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeTitle}>Bienvenue sur Jereo !</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.welcomeSubtitle}>
            Token : {token ? "Connecté" : "Pas connecté"}
          </Text>
        </View>

        {/* Filtres */}
        <View style={styles.filters}>
          {['Tous', 'En cours', 'Pris en charge', 'Resolu'].map((label, index) => (
            <TouchableOpacity key={index} style={styles.filterButton}>
              <Text style={styles.filterText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contenu principal */}
        <ScrollView style={styles.content}>
          {/* Post exemple */}
          <View style={styles.postCard}>
            <View style={styles.userRow}>
              <Image
                source={require('../../assets/profiles/kevinfal.jpg')}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>Kevin falisoa</Text>
                <Text style={styles.timestamp}>21 min</Text>
              </View>
              <View style={styles.statusBadgeYellow}>
                <Text style={styles.statusText}>Pris en charge</Text>
              </View>
            </View>

            <Text style={styles.description}>
              Lavaka eo ampovoan-dalana aty Tsimbazaza. Eo akaikin’ny ministeran’ny fizahàn-tany.
            </Text>

            <Image
              source={require('../../assets/description/lavaka_lalana.jpg')}
              style={styles.reportImage}
            />

            <Text style={styles.mapLabel}>Localisation :</Text>

            <Image
              source={require('../../assets/carte/carte.png')}
              style={styles.mapImage}
            />
          </View>


          <View style={styles.postCard}>
            <View style={styles.userRow}>
              <Image
                source={require('../../assets/profiles/kevinfal.jpg')}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>Kevin falisoa</Text>
                <Text style={styles.timestamp}>21 min</Text>
              </View>
              <View style={styles.statusBadgeYellow}>
                <Text style={styles.statusText}>Pris en charge</Text>
              </View>
            </View>

            <Text style={styles.description}>
              Lavaka eo ampovoan-dalana aty Tsimbazaza. Eo akaikin’ny ministeran’ny fizahàn-tany.
            </Text>

            <Image
              source={require('../../assets/description/lavaka_lalana.jpg')}
              style={styles.reportImage}
            />

            <Text style={styles.mapLabel}>Localisation :</Text>

            <Image
              source={require('../../assets/carte/carte.png')}
              style={styles.mapImage}
            />
          </View>


          <View style={styles.postCard}>
            <View style={styles.userRow}>
              <Image
                source={require('../../assets/profiles/kevinfal.jpg')}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>Kevin falisoa</Text>
                <Text style={styles.timestamp}>21 min</Text>
              </View>
              <View style={styles.statusBadgeYellow}>
                <Text style={styles.statusText}>Pris en charge</Text>
              </View>
            </View>

            <Text style={styles.description}>
              Lavaka eo ampovoan-dalana aty Tsimbazaza. Eo akaikin’ny ministeran’ny fizahàn-tany.
            </Text>

            <Image
              source={require('../../assets/description/lavaka_lalana.jpg')}
              style={styles.reportImage}
            />

            <Text style={styles.mapLabel}>Localisation :</Text>

            <Image
              source={require('../../assets/carte/carte.png')}
              style={styles.mapImage}
            />
          </View>


          <View style={styles.postCard}>
            <View style={styles.userRow}>
              <Image
                source={require('../../assets/profiles/kevinfal.jpg')}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>Kevin falisoa</Text>
                <Text style={styles.timestamp}>21 min</Text>
              </View>
              <View style={styles.statusBadgeYellow}>
                <Text style={styles.statusText}>Pris en charge</Text>
              </View>
            </View>

            <Text style={styles.description}>
              Lavaka eo ampovoan-dalana aty Tsimbazaza. Eo akaikin’ny ministeran’ny fizahàn-tany.
            </Text>

            <Image
              source={require('../../assets/description/lavaka_lalana.jpg')}
              style={styles.reportImage}
            />

            <Text style={styles.mapLabel}>Localisation :</Text>

            <Image
              source={require('../../assets/carte/carte.png')}
              style={styles.mapImage}
            />
          </View>

          {/* Tu peux répéter d'autres posts ici */}
        </ScrollView>
        <Navbar />
      </View>
    );
  };

  const styles = StyleSheet.create({
    welcomeBox: {
      backgroundColor: '#fff',
      padding: 10,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    welcomeTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#8B0000',
    },
    userName: {
      fontSize: 15,
      fontWeight: '600',
      marginTop: 2,
      marginBottom: 4,
      color: '#444',
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: 'gray',
    },
    filters: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
      backgroundColor: '#fff',
    },
    filterButton: {
      borderWidth: 1,
      borderColor: '#8B0000',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    filterText: {
      color: '#8B0000',
    },
    content: {
      backgroundColor: '#f6f6f6',
    },
    postCard: {
      backgroundColor: '#fff',
      padding: 15,
      margin: 10,
      borderRadius: 10,
      elevation: 2,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#ccc',
    },
    username: {
      fontWeight: 'bold',
    },
    timestamp: {
      fontSize: 12,
      color: 'gray',
    },
    statusBadgeYellow: {
      backgroundColor: '#ffeb3b',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 2,
      marginLeft: 'auto',
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    description: {
      marginVertical: 10,
    },
    reportImage: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      resizeMode: 'cover',
    },
    mapLabel: {
      marginTop: 15,
      marginBottom: 5,
      fontWeight: 'bold',
      color: '#8B0000',
    },
    mapImage: {
      width: '100%',
      height: 150,
      borderRadius: 10,
    },
  });

  export default Accueil;
