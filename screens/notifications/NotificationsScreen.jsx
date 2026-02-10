import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Images from '../../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');

  // Sample notifications data matching image
  const [notifications] = useState([
    {
      id: 1,
      timestamp: '4h',
      text: 'طلب الحصول علي السجلات.',
      icon: 'help',
      isNew: false
    },
    {
      id: 2,
      timestamp: '6h',
      text: 'تم تحديث رابط المشاركة.',
      icon: 'link',
      isNew: false
    },
    {
      id: 3,
      timestamp: '8h',
      text: 'تم رفع الملفات بنجاح.',
      icon: 'upload',
      isNew: false
    },
    {
      id: 4,
      timestamp: '12h',
      text: 'تنبيه هام: تحديث النظام.',
      icon: 'bolt',
      isNew: true
    },
    {
      id: 5,
      timestamp: '1d',
      text: 'طلب الحصول علي السجلات.',
      icon: 'help',
      isNew: false
    },
    {
      id: 6,
      timestamp: '2d',
      text: 'تم تحديث رابط المشاركة.',
      icon: 'link',
      isNew: false
    }
  ]);

  const getNotificationIcon = (iconType) => {
    switch (iconType) {
      case 'help':
        return Images.alarm; // Using alarm as placeholder for help icon
      case 'link':
        return Images.routing; // Using routing as placeholder for link icon
      case 'upload':
        return Images.upload;
      case 'bolt':
        return Images.alarm; // Using alarm as placeholder for bolt icon
      default:
        return Images.notification;
    }
  };

  const filteredNotifications = activeTab === 'new' 
    ? notifications.filter(notif => notif.isNew)
    : notifications;

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      {/* Timestamp */}
      <Text style={styles.timestamp}>{item.timestamp}</Text>
      
      {/* Notification Text */}
      <Text style={styles.notificationText}>{item.text}</Text>
      
      {/* Notification Icon */}
      <View style={styles.iconContainer}>
        <Image 
          source={getNotificationIcon(item.icon)} 
          style={styles.notificationIcon} 
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image 
            source={Images.arrowLeft} 
            style={[styles.backIcon, { transform: [{ rotate: i18n.dir() === 'rtl' ? '180deg' : '0deg' }] }]}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('notifications.title', { defaultValue: 'الاشعارات' })}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'all' ? styles.activeToggle : styles.inactiveToggle
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.toggleText,
            activeTab === 'all' ? styles.activeToggleText : styles.inactiveToggleText
          ]}>
            {t('notifications.all', { defaultValue: 'الكل' })}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === 'new' ? styles.activeToggle : styles.inactiveToggle
          ]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[
            styles.toggleText,
            activeTab === 'new' ? styles.activeToggleText : styles.inactiveToggleText
          ]}>
            {t('notifications.new', { defaultValue: 'جديد' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: hp(4),
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backIcon: {
    width: wp(6),
    height: wp(6),
    tintColor: '#000000',
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  placeholder: {
    width: wp(6),
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    gap: wp(3),
  },
  toggleButton: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  inactiveToggle: {
    backgroundColor: '#E9ECEF',
  },
  toggleText: {
    fontSize: wp(4),
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#ffffff',
  },
  inactiveToggleText: {
    color: '#495057',
  },
  list: {
    flex: 1,
  },
  listContainer: {
    padding: wp(4),
    gap: hp(1.5),
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timestamp: {
    fontSize: wp(3.5),
    color: '#6C757D',
    fontWeight: '500',
    flex: 1,
  },
  notificationText: {
    fontSize: wp(4),
    color: '#212529',
    fontWeight: '500',
    flex: 3,
    textAlign: 'center',
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#D1ECF1',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: wp(5),
    height: wp(5),
    tintColor: '#0C5460',
  },
});

export default NotificationsScreen;
