import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Text, 
  Modal, 
  ScrollView, 
  Alert,
  Animated,
  Dimensions 
} from 'react-native';
import { API_URL, BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

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

const { width } = Dimensions.get('window');

const Header = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<any>(null);
  const [autorites, setAutorites] = useState<Record<string, string>>({});
  const [shakeAnimation] = useState(new Animated.Value(0));
  
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
        
        // Animation de secousse pour la cloche
        Animated.sequence([
          Animated.timing(shakeAnimation, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true
          }),
          Animated.timing(shakeAnimation, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true
          }),
          Animated.timing(shakeAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true
          })
        ]).start();
        
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

  const clearAllNotifications = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        await fetch(`${API_URL}/notifications/${parsedUser.email}/clear`, { 
          method: 'DELETE' 
        });
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications:', error);
    }
  };

  const animatedStyle = {
    transform: [{ translateX: shakeAnimation }]
  };

  return (
    <LinearGradient
      colors={['#8B0000', '#A52A2A']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Image
        source={require('../../assets/logo/logo2.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />

      <View style={styles.iconsContainer}>
        <TouchableOpacity 
          onPress={openNotifications} 
          style={styles.notificationButton}
        >
          <Animated.View style={animatedStyle}>
            <Icon name="notifications" size={24} color="white" />
          </Animated.View>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/pages/Profil')}
          style={styles.profileButton}
        >
          <Icon name="account-circle" size={24} color="white" />
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
            <LinearGradient
              colors={['#8B0000', '#A52A2A']}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.modalTitle}>Notifications</Text>
              <View style={styles.modalHeaderActions}>
                {notifications.length > 0 && (
                  <TouchableOpacity 
                    onPress={clearAllNotifications}
                    style={styles.clearButton}
                  >
                    <Icon name="delete-sweep" size={20} color="white" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            
            <ScrollView style={styles.notificationsList}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="notifications-off" size={50} color="#ccc" />
                  <Text style={styles.noNotifications}>Aucune notification</Text>
                </View>
              ) : (
                notifications.map(notification => (
                  <View 
                    key={notification._id} 
                    style={[
                      styles.notificationItem,
                      notification.status === 'non_lu' && styles.unreadNotification
                    ]}
                  >
                    <Image
                      source={{ uri: `${BASE_URL}${notification.imageUrl}` }}
                      style={styles.notificationImage}
                    />
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <View style={styles.notificationMeta}>
                        <View style={styles.metaItem}>
                          <Icon name="person" size={12} color="#666" />
                          <Text style={styles.notificationAuthor}>
                            {notification.autoriteName}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Icon name="schedule" size={12} color="#666" />
                          <Text style={styles.notificationDate}>
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => deleteNotification(notification._id)}
                      style={styles.deleteButton}
                    >
                      <Icon name="delete-outline" size={20} color="#999" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  logoImage: {
    width: 100,
    height: 30,
    tintColor: 'white',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  notificationButton: {
    position: 'relative',
  },
  profileButton: {
    padding: 4,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    backgroundColor: 'white',
    marginTop: 60,
    marginHorizontal: 20,
    borderRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  clearButton: {
    padding: 4,
  },
  closeButton: {
    padding: 4,
  },
  notificationsList: {
    padding: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noNotifications: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  unreadNotification: {
    backgroundColor: '#f8f9fa',
  },
  notificationImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
    lineHeight: 20,
  },
  notificationMeta: {
    flexDirection: 'column',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationAuthor: {
    fontSize: 12,
    color: '#666',
  },
  notificationDate: {
    fontSize: 11,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
});

export default Header;