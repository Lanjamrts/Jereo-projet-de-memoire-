import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text, Modal, ScrollView, Alert } from 'react-native';
import { API_URL, BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { useRouter } from 'expo-router';

interface Notification {
  _id: string;
  message: string;
  status: string;
  createdAt: string;
  imageUrl: string;
  autoriteId: string;
  autoriteName?: string;
}

interface Autorite {
  _id: string;
  nom: string;
}

const Header = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<any>(null);
  const [autorites, setAutorites] = useState<Record<string, string>>({});
  
  const router = useRouter();

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadAutorites = async () => {
      try {
        const response = await fetch(`${API_URL}/autorites`);
        const data = await response.json();
        
        const autoritesMap: Record<string, string> = {};
        data.forEach((autorite: Autorite) => {
          autoritesMap[autorite._id] = autorite.nom;
        });
        
        setAutorites(autoritesMap);
      } catch (error) {
        console.error('Erreur lors du chargement des autorités:', error);
      }
    };

    loadAutorites();
  }, []);

  useEffect(() => {
    if (socket) {
      const registerUser = async () => {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          socket.emit('register', parsedUser.email);
        }
      };

      socket.on('notification', (notification: Notification) => {
        const autoriteName = notification.autoriteId && autorites[notification.autoriteId] 
          ? autorites[notification.autoriteId] 
          : "Autorité inconnue";
        
        const notificationWithAutoriteName = {
          ...notification,
          autoriteName
        };
        
        setNotifications(prev => [notificationWithAutoriteName, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        if (!notification.message.includes("Signalement envoyé")) {
          Alert.alert('Nouvelle notification', notification.message);
        }
      });

      registerUser();
    }

    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket, autorites]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          const response = await fetch(`${API_URL}/notifications/${parsedUser.email}`);
          const data = await response.json();
          
          const notificationsWithAutoriteNames = data.map((notification: Notification) => ({
            ...notification,
            autoriteName: notification.autoriteId && autorites[notification.autoriteId] 
              ? autorites[notification.autoriteId] 
              : "Autorité inconnue"
          }));
          
          setNotifications(notificationsWithAutoriteNames);
          
          const unread = data.filter((n: Notification) => n.status === 'non_lu').length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    };

    if (Object.keys(autorites).length > 0) {
      loadNotifications();
    }
  }, [autorites]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, status: 'lu' } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/delete`, { method: 'PUT' });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const openNotifications = () => {
    setModalVisible(true);
    notifications.forEach(notif => {
      if (notif.status === 'non_lu') {
        markAsRead(notif._id);
      }
    });
    setUnreadCount(0);
  };

  return (
    <View style={styles.header}>
      <Image
        source={require('../../assets/logo/logo2.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />

      <View style={styles.iconsContainer}>
        <TouchableOpacity onPress={openNotifications} style={styles.notificationButton}>
          <Image
            source={require('../../assets/icons/bell.png')}
            style={styles.profileIcon}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push('/pages/Profil')}>
          <Image
            source={require('../../assets/icons/profil.png')}
            style={styles.profileIcon}
          />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Fermer</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationsList}>
              {notifications.length === 0 ? (
                <Text style={styles.noNotifications}>Aucune notification</Text>
              ) : (
                notifications.map(notification => (
                  <View key={notification._id} style={styles.notificationItem}>
                    <Image
                      source={{ uri: `${BASE_URL}${notification.imageUrl}` }}
                      style={styles.notificationImage}
                    />
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationAuthor}>
                        Par: {notification.autoriteName}
                      </Text>
                      <Text style={styles.notificationDate}>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => deleteNotification(notification._id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    marginRight: 15,
  },
  profileIcon: {
    width: 20,
    height: 20,
    borderRadius: 15,
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginTop: 50,
    marginHorizontal: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  closeButton: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  notificationsList: {
    padding: 10,
  },
  noNotifications: {
    textAlign: 'center',
    padding: 20,
    color: '#888',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  notificationImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  notificationDate: {
    fontSize: 11,
    color: '#999',
  },
  deleteButton: {
    padding: 5,
  },
  deleteText: {
    fontSize: 20,
    color: '#999',
  },
});

export default Header;