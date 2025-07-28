import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

const mockReports = [
  { id: 1, status: 'En cours', color: '#f44336' },
  { id: 2, status: 'Pris en charge', color: '#ffeb3b' },
  { id: 3, status: 'Resolu', color: '#4caf50' },
  { id: 4, status: 'Resolu', color: '#4caf50' },
];

const HistoryScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Header />

      <Text style={styles.title}>Historique de mes signalement</Text>

      <ScrollView style={styles.scroll}>
        {mockReports.map((report) => (
          <View key={report.id} style={styles.card}>
            <View style={styles.row}>
              <Image
                source={require('../../assets/description/lavaka_lalana.jpg')}
                style={styles.image}
              />
              <Image
                source={require('../../assets/carte/carte.png')}
                style={styles.map}
              />
            </View>

            <Text style={styles.time}>2 j</Text>

            <View style={[styles.badge, { backgroundColor: report.color }]}>
              <Text style={styles.badgeText}>{report.status}</Text>
            </View>

            <Text style={styles.label}>Autorité signalé : <Text style={styles.bold}>Pompier</Text></Text>
            <Text style={styles.desc}>
              Lavaka eo ampovoan-dalana aty Tsimbazaza. Eo akaikin’ny
              ministeran’ny fizahàn-tany.....
            </Text>
          </View>
        ))}
      </ScrollView>

      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  image: {
    width: '48%',
    height: 100,
    borderRadius: 8,
  },
  map: {
    width: '48%',
    height: 100,
    borderRadius: 8,
  },
  time: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: '#8B0000',
  },
  desc: {
    fontSize: 13,
    marginTop: 5,
    color: '#555',
  },
});

export default HistoryScreen;
