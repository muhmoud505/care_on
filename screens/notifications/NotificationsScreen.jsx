import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import Images from '../../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const isRTL = i18n.dir() === 'rtl';

  // Sample notifications data matching the design
  const [notifications] = useState([
    {
      id: 1,
      timestamp: '4h',
      text: t('notifications.items.request_records', { defaultValue: 'طلب الحصول علي السجلات.' }),
      icon: 'help',
      isNew: false
    },
    {
      id: 2,
      timestamp: '4h',
      text: t('notifications.items.pay_invoice', { defaultValue: 'سداد الفاتورة.' }),
      icon: 'payment',
      isNew: false
    },
    {
      id: 3,
      timestamp: '4h',
      text: t('notifications.items.upload_result', { defaultValue: 'رفع نتيجة تحليل.' }),
      icon: 'upload',
      isNew: false
    },
    {
      id: 4,
      timestamp: '4h',
      text: t('notifications.items.system_announcement', { defaultValue: 'اعلان من السيستيم.' }),
      icon: 'announcement',
      isNew: false
    }
  ]);

  const getNotificationIcon = (iconType) => {
    switch (iconType) {
      case 'help':
        return Images.alarm;
      case 'link':
        return Images.routing;
      case 'upload':
        return Images.upload;
      case 'bolt':
        return Images.alarm;
      case 'payment':
        return Images.routing;
      case 'announcement':
        return Images.notification;
      default:
        return Images.notification;
    }
  };

  const filteredNotifications = activeTab === 'new' 
    ? notifications.filter(notif => notif.isNew)
    : notifications;

  const renderNotificationItem = ({ item }) => (
    <View style={[
      styles.notificationItem,
      isRTL ? styles.notificationItemRtl : styles.notificationItemLtr
    ]}>
      {/* Timestamp */}
      <Text style={[styles.timestamp, isRTL ? styles.timestampRtl : styles.timestampLtr]}>
        {item.timestamp}
      </Text>
      
      {/* Notification Text */}
      <Text style={[styles.notificationText, isRTL ? styles.notificationTextRtl : styles.notificationTextLtr]}>
        {item.text}
      </Text>
      
      {/* Notification Icon */}
      <View style={[styles.iconContainer, isRTL ? styles.iconContainerRtl : styles.iconContainerLtr]}>
        <Image 
          source={getNotificationIcon(item.icon)} 
          style={styles.notificationIcon} 
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { direction: i18n.dir() }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
     <CustomHeader text={"الاشعارات"}/>
      {/* Toggle pill */}
      <View style={styles.toggleOuter}>
        <View style={styles.toggleContainer}>
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
        </View>
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
    backgroundColor: '#F5F9FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
    paddingBottom: hp(1.5),
    backgroundColor: '#F5F9FF',
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
  toggleOuter: {
    alignItems: 'center',
    paddingTop: hp(1),
    paddingBottom: hp(2),
    backgroundColor: '#F5F9FF',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: wp(7),
    padding: hp(0.4),
    width: wp(40),
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: hp(0.8),
    borderRadius: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#1E6FEA',
  },
  inactiveToggle: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: wp(3.7),
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
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(3),
    gap: hp(1.2),
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(4),
    marginBottom: hp(0.5),
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
  notificationItemRtl: {
    flexDirection: 'row',
  },
  notificationItemLtr: {
    flexDirection: 'row-reverse',
  },
  timestamp: {
    fontSize: wp(3),
    color: '#8E9AAE',
    fontWeight: '500',
  },
  timestampRtl: {
    flex: 1,
    textAlign: 'left',
  },
  timestampLtr: {
    flex: 1,
    textAlign: 'right',
  },
  notificationText: {
    fontSize: wp(3.8),
    color: '#000000',
    fontWeight: '500',
  },
  notificationTextRtl: {
    flex: 3,
    textAlign: 'right',
  },
  notificationTextLtr: {
    flex: 3,
    textAlign: 'left',
  },
  iconContainer: {
    width: wp(9.5),
    height: wp(9.5),
    borderRadius: wp(3.5),
    backgroundColor: '#D2F6D7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerRtl: {
    marginLeft: wp(2),
  },
  iconContainerLtr: {
    marginRight: wp(2),
  },
  notificationIcon: {
    width: wp(4.8),
    height: wp(4.8),
    tintColor: '#1E89FF',
  },
});

export default NotificationsScreen;
