import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import Images from '../../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const DoctorsUsedCodesScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl'; // Check if RTL

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
      {/* Top Row - Status Tag (Left/Right based on language) and Doctor Info */}
      <View style={[
        styles.topRow,
        { flexDirection: isRTL ? 'row-reverse' : 'row' }
      ]}>
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
        <View style={styles.doctorInfoContainer}>
          <Text style={styles.infoText}>{item.doctorName}</Text>
          <Image source={Images.user} style={styles.infoIcon} />
        </View>
      </View>

      {/* Second Row - Date */}
      <View style={[
        styles.dateRow,
        { flexDirection: isRTL ? 'row' : 'row-reverse' }
      ]}>
        <View />
        <View style={styles.dateContainer}>
          <Text style={styles.infoText}>{item.requestDate}</Text>
          <Image source={Images.alarm} style={styles.infoIcon} />
        </View>
         <Text style={[styles.timestamp, { textAlign: isRTL ? 'left' : 'right' }]}>
        {item.timestamp}
      </Text>
      </View>

      {/* Bottom Timestamp */}
     
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <CustomHeader text={'اطباء استخدموا اكوادك'}/>

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
    marginBottom: hp(1),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  statusTag: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(4),
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
  doctorInfoContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: wp(2),
    paddingVertical: hp(0.5),  // Add consistent vertical padding
  },
 dateRow: {
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: hp(0.5),  // Add margin between date row and timestamp
  gap: wp(2),  // Add gap for consistency
},
dateContainer: {
  flexDirection: 'row-reverse',
  alignItems: 'center',
  gap: wp(2),
  paddingVertical: hp(0.5),
  flex: 1,  // Take available space like doctorInfoContainer
  justifyContent: 'flex-end',  // Align to the right
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
    marginTop: hp(0.5),
    fontStyle: 'italic',
  },
});

export default DoctorsUsedCodesScreen;
