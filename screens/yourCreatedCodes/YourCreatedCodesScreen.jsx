import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Images from '../../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const YourCreatedCodesScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  // Sample data for created codes
  const [createdCodes] = useState([
    {
      id: 1,
      code: '5824',
      createdAt: t('codes.createdAt', { defaultValue: '10 January 2026 05:47 PM' }),
      status: 'active',
      expiresAt: t('codes.expiresAt', { defaultValue: '10 January 2026 06:47 PM' })
    },
    {
      id: 2,
      code: '9135',
      createdAt: t('codes.createdAt', { defaultValue: '10 January 2026 01:15 PM' }),
      status: 'expired',
      expiresAt: t('codes.expiresAt', { defaultValue: '10 January 2026 02:15 PM' })
    },
    {
      id: 3,
      code: '7462',
      createdAt: t('codes.createdAt', { defaultValue: '09 January 2026 11:30 AM' }),
      status: 'active',
      expiresAt: t('codes.expiresAt', { defaultValue: '09 January 2026 12:30 PM' })
    }
  ]);

  const renderCodeItem = ({ item }) => (
    <View style={styles.codeCard}>
      <View style={styles.cardContent}>
        {/* Icon on the left */}
        <View style={styles.iconContainer}>
          <Image source={Images.createCodeG} style={styles.codeIcon} />
        </View>
        
        {/* Code in the center */}
        <Text style={styles.codeValue}>{item.code}</Text>
        
        {/* Status and time on the right */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, item.status === 'active' ? styles.activeStatus : styles.expiredStatus]}>
            <Text style={styles.statusText}>{item.status === 'active' ? t('codes.active', { defaultValue: 'Active' }) : t('codes.expired', { defaultValue: 'Expired' })}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{item.createdAt}</Text>
            <Text style={styles.timeText}>{item.expiresAt}</Text>
          </View>
        </View>
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
          {t('your_created_codes.title', { defaultValue: 'أكوادك المنشأة' })}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Codes List */}
      <FlatList
        data={createdCodes}
        renderItem={renderCodeItem}
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
  list: {
    flex: 1,
  },
  listContainer: {
    padding: wp(4),
    gap: hp(2),
  },
  codeCard: {
    backgroundColor: '#ffffff',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: wp(12),
    height: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeIcon: {
    width: wp(6),
    height: wp(6),
    tintColor: '#007AFF',
  },
  codeValue: {
    fontSize: wp(5),
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: wp(1),
    flex: 1,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: hp(1),
  },
  statusBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
  },
  activeStatus: {
    backgroundColor: '#28A745',
  },
  expiredStatus: {
    backgroundColor: '#DC3545',
  },
  statusText: {
    fontSize: wp(3),
    fontWeight: '600',
    color: '#ffffff',
  },
  timeContainer: {
    alignItems: 'flex-end',
    gap: hp(0.5),
  },
  timeText: {
    fontSize: wp(3),
    color: '#6C757D',
  },
});

export default YourCreatedCodesScreen;
