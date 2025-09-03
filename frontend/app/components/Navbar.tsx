import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Link, usePathname } from "expo-router";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Incidents",
      route: "/pages/Accueil" as const,
      icon: "home",
      activeIcon: "home-outline"
    },
    {
      name: "Signaler",
      route: "/pages/Signalement" as const,
      icon: "alert-circle",
      activeIcon: "alert-circle-outline"
    },
    {
      name: "Historique",
      route: "/pages/Liste" as const,
      icon: "history",
      activeIcon: "history"
    }
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => {
        const isActive = pathname === item.route;
        
        return (
          <Link key={index} href={item.route} asChild>
            <TouchableOpacity style={styles.navItem}>
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <Icon 
                  name={isActive ? item.icon : item.activeIcon} 
                  size={24} 
                  color={isActive ? '#8B0000' : '#666'} 
                />
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {item.name}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '30%',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B0000',
  },
});

export default Navbar;