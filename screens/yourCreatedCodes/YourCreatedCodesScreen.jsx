import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
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
      createdAt: '10 Jan 2026 05:47 PM',
      status: 'active',
      expiresAt: '10 Jan 2026 06:47 PM'
    },
    {
      id: 2,
      code: '1234',
      createdAt: '9 Jan 2026 03:30 PM',
      status: 'expired',
      expiresAt: '9 Jan 2026 04:30 PM'
    },
    {
      id: 3,
      code: '9876',
      createdAt: '8 Jan 2026 11:15 AM',
      status: 'expired',
      expiresAt: '8 Jan 2026 12:15 PM'
    }
  ]);

  const renderCodeItem = ({ item }) => (
    <View style={styles.codeItem}>
      <View style={styles.codeHeader}>
        <Text style={styles.codeLabel}>
          {t('your_created_codes.code', { defaultValue: 'الكود:' })}
        </Text>
        <Text style={styles.codeValue}>{item.code}</Text>
      </View>
      
      <View style={styles.codeDetails}>
        <Text style={styles.detailText}>
          {t('your_created_codes.created', { defaultValue: 'تم الانشاء:' })} {item.createdAt}
        </Text>
        <Text style={styles.detailText}>
          {t('your_created_codes.expires', { defaultValue: 'ينتهي:' })} {item.expiresAt}
        </Text>
      </View>
      
      <View style={[
        styles.statusBadge,
        item.status === 'active' ? styles.activeBadge : styles.expiredBadge
      ]}>
        <Text style={[
          styles.statusText,
          item.status === 'active' ? styles.activeText : styles.expiredText
        ]}>
          {item.status === 'active' 
            ? t('your_created_codes.active', { defaultValue: 'نشط' })
            : t('your_created_codes.expired', { defaultValue: 'منتهي' })
          }
        </Text>
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
  codeItem: {
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
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  codeLabel: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#495057',
  },
  codeValue: {
    fontSize: wp(5),
    fontWeight: '700',
    color: '#007AFF',
  },
  codeDetails: {
    marginBottom: hp(2),
  },
  detailText: {
    fontSize: wp(3.5),
    color: '#6C757D',
    marginBottom: hp(0.5),
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(4),
  },
  activeBadge: {
    backgroundColor: '#D4EDDA',
  },
  expiredBadge: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  activeText: {
    color: '#155724',
  },
  expiredText: {
    color: '#721C24',
  },
});

export default YourCreatedCodesScreen;
