import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import Images from '../../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;
// Responsive font: converts a pixel value (based on a 375px wide design) to device width
const rf = (px) => Math.round((px / 375) * SCREEN_WIDTH);

const YourCreatedCodesScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  // Sample data for created codes (Arabic labels & timestamps to match design)
  const [createdCodes] = useState([
    {
      id: 1,
      code: '9999',
      createdAt: '10 يناير 2026 05:47 م',
      status: 'active',
    },
    {
      id: 2,
      code: '9999',
      createdAt: '10 يناير 2026 05:47 م',
      status: 'expired',
    },
  ]);

  const renderCodeItem = ({ item }) => {
    const isRTL = i18n.dir() === 'rtl';
    const handleCopy = async () => {
      try {
        await Clipboard.setStringAsync(item.code);
        Alert.alert('', 'تم النسخ');
      } catch (e) {
        console.error('Clipboard copy failed', e);
        Alert.alert('', 'فشل النسخ');
      }
    };

    return (
      <View style={styles.codeCard}>
        <View style={[styles.cardRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}> 
          <View style={styles.leftBlock}>
            <View style={[styles.smallBadge, item.status === 'active' ? styles.smallBadgeActive : styles.smallBadgeExpired]}>
              <Text style={[styles.smallBadgeText, item.status === 'active' ? styles.smallBadgeTextActive : styles.smallBadgeTextExpired]}>{item.status === 'active' ? t('codes.active', { defaultValue: 'صالح' }) : t('codes.expired', { defaultValue: 'غير صالح' })}</Text>
            </View>
            <Text style={styles.timeTextSmall}>{item.createdAt}</Text>
          </View>

          <View style={styles.rightBlock}>
            <View style={styles.codeRow}>
              <Text style={[styles.codeValueBig, isRTL ? { marginLeft: wp(3) } : { marginRight: wp(3) }]}>{item.code}</Text>
              <TouchableOpacity onPress={handleCopy} style={styles.copyBox}>
                <Image source={Images.createCode} style={styles.copyIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <CustomHeader text={'الاكواد'}/>
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
    fontSize: rf(20),
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
    justifyContent:'space-evenly',
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
    flexDirection: 'row-reverse',
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
  cardInner: {
    flexDirection: 'row',

    justifyContent: 'space-between',
  },
  leftColumn: {
    width: wp(30),
    alignItems: 'flex-start',
    paddingRight: wp(2),
  },
  centerColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightColumn: {
    width: wp(12),

  },
  statusBadge: {
 
    borderRadius: wp(2),
    marginBottom: hp(1),
  },
  statusText: {
    fontSize: wp(3.2),
    fontWeight: '700',
    color: '#fff',
  },
  activeStatus: {
    backgroundColor: '#DFF3E0',
  },
  expiredStatus: {
    backgroundColor: '#FCEAEA',
  },
  timeTextSmall: {
    fontSize: wp(3),
    color: '#9AA0A6',
  },
  copyButton: {
    backgroundColor: 'transparent',

    borderRadius: wp(3),
  },
  cardRow: {
   columnGap: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftBlock: {
    width: wp(40),
    direction: 'ltr',

  },
  rightBlock: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  smallBadge: {
    paddingHorizontal: wp(2.2),
    paddingVertical: hp(0.4),
    borderRadius: wp(2.5),
    alignSelf: 'flex-start',
    marginBottom: hp(0.6),
  },
  smallBadgeActive: {
    backgroundColor: '#E9F8EE',
  },
  smallBadgeExpired: {
    backgroundColor: '#FCEAEA',
  },
  smallBadgeText: {
    fontSize: wp(3.2),
    fontWeight: '700',
  },
  smallBadgeTextActive: {
    color: '#2D9A4A',
  },
  smallBadgeTextExpired: {
    color: '#D23F3F',
  },
  codeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: wp(3),
  },
  codeValueBig: {
    fontSize: rf(20),
    fontWeight: '900',
    color: '#000000',
  },
  copyBox: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  copyIcon: {
    width: wp(6),
    height: wp(6),
    resizeMode: 'contain',
  },
});

export default YourCreatedCodesScreen;
