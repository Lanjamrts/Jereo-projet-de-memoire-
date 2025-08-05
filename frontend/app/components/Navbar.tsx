import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { Link, usePathname } from "expo-router";

const Navbar = () => {
  const pathname = usePathname(); // donne la route actuelle

  return (
    <View style={styles.container}>

      {/* Bouton Accueil */}
      <Link href="../pages/Accueil" asChild>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={
              pathname === "/pages/Accueil"
                ? require('../../assets/icons_navbar/home-active.png') // icône active
                : require('../../assets/icons_navbar/home.png')        // icône inactive
            }
            style={styles.icon}
          />
          <Text
            style={[
              styles.label,
              pathname === "/pages/Accueil" && styles.activeLabel
            ]}
          >
            Incidents
          </Text>
        </TouchableOpacity>
      </Link>

      {/* Bouton Signaler */}
      <Link href="../pages/Signalement" asChild>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={
              pathname === "/pages/Signalement"
                ? require('../../assets/icons_navbar/signaler-active.png')
                : require('../../assets/icons_navbar/signaler.png')
            }
            style={styles.icon}
          />
          <Text
            style={[
              styles.label,
              pathname === "/pages/Signalement" && styles.activeLabel
            ]}
          >
            Signaler
          </Text>
        </TouchableOpacity>
      </Link>

      {/* Bouton Profil */}
      <Link href="../pages/Liste" asChild>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={
              pathname === "/pages/Liste"
                ? require('../../assets/icons_navbar/liste-active.png')
                : require('../../assets/icons_navbar/liste.png')
            }
            style={styles.icon}
          />
          <Text
            style={[
              styles.label,
              pathname === "/pages/Liste" && styles.activeLabel
            ]}
          >
            Mes signalements
          </Text>
        </TouchableOpacity>
      </Link>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#8B0000',
  },
  activeLabel: {
    fontWeight: 'bold',
  },
});

export default Navbar;
