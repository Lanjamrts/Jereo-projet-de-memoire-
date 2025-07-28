import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';

const Header = () => {
  return (
    <View style={styles.header}>
      <Image
        source={require('../../assets/logo/logo2.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />

      <TouchableOpacity>
        <Image
          source={require('../../assets/icons/profil.png')}
          style={styles.profileIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#8B0000',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,      
    height: 30,  
  },
  profileIcon: {
    width: 20,
    height: 20,
    borderRadius: 15,
    marginRight: 10,
  },
});

export default Header;
