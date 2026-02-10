import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions, Image, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Images from '../../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const DoctorsUsedCodesScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  // Sample data matching the image
  const [doctorRequests] = useState([
    {
      id: 1,
      status: 'accepted',
      doctorName: 'دكتور أحمد محمد',
      requestDate: '10/1/2026',
      timestamp: '10 Jan 2026 05:47 PM'
    },
    {
      id: 2,
      status: 'rejected',
      doctorName: 'دكتور سارة أحمد',
      requestDate: '9/1/2026',
      timestamp: '09 Jan 2026 03:30 PM'
    },
    {
      id: 3,
      status: 'accepted',
      doctorName: 'دكتور خالد العلي',
      requestDate: '8/1/2026',
      timestamp: '08 Jan 2026 11:15 AM'
    },
    {
      id: 4,
      status: 'accepted',
      doctorName: 'دكتور منى صالح',
      requestDate: '7/1/2026',
      timestamp: '07 Jan 2026 02:45 PM'
    }
  ]);

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      {/* Status Tag */}
      <View style={[
        styles.statusTag,
        item.status === 'accepted' ? styles.acceptedStatus : styles.rejectedStatus
      ]}>
        <Text style={[
          styles.statusText,
          item.status === 'accepted' ? styles.acceptedStatusText : styles.rejectedStatusText
        ]}>
          {item.status === 'accepted' 
            ? t('doctors_used_codes.accepted', { defaultValue: 'تم القبول' })
            : t('doctors_used_codes.rejected', { defaultValue: 'تم الرفض' })
          }
        </Text>
      </View>

      {/* Doctor Name */}
      <View style={styles.infoRow}>
        <Image source={Images.user} style={styles.infoIcon} />
        <Text style={styles.infoText}>
          {t('doctors_used_codes.doctor_name', { defaultValue: 'اسم الدكتور:' })} {item.doctorName}
        </Text>
      </View>

      {/* Request Date */}
      <View style={styles.infoRow}>
        <Image source={Images.alarm} style={styles.infoIcon} />
        <Text style={styles.infoText}>
          {t('doctors_used_codes.request_date', { defaultValue: 'تاريخ الطلب:' })} {item.requestDate}
        </Text>
      </View>

      {/* Timestamp */}
      <Text style={styles.timestamp}>{item.timestamp}</Text>
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
          {t('doctors_used_codes.title', { defaultValue: 'اطباء استخدموا اكوادك' })}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* List of Requests */}
      <FlatList
        data={doctorRequests}
        renderItem={renderRequestItem}
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
  requestItem: {
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
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(4),
    marginBottom: hp(2),
  },
  acceptedStatus: {
    backgroundColor: '#D4EDDA',
  },
  rejectedStatus: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  acceptedStatusText: {
    color: '#155724',
  },
  rejectedStatusText: {
    color: '#721C24',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
    gap: wp(2),
  },
  infoIcon: {
    width: wp(4),
    height: wp(4),
    tintColor: '#6C757D',
  },
  infoText: {
    fontSize: wp(4),
    color: '#495057',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: wp(3.2),
    color: '#6C757D',
    textAlign: 'right',
    marginTop: hp(1),
    fontStyle: 'italic',
  },
});

export default DoctorsUsedCodesScreen;
