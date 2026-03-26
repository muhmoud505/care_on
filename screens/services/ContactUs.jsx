import { useTranslation } from 'react-i18next';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import useRTL from '../../hooks/useRTL';
import { hp, wp } from '../../utils/responsive';

const ContactUs = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isRTL, rowDirection } = useRTL(); // Use reactive useRTL hook

  const handleCallPress = (phoneNumber) => {
    Alert.alert(
      t('contact_us.call_title'),
      t('contact_us.call_message', { phoneNumber }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('contact_us.call'), onPress: () => Linking.openURL(`tel:${phoneNumber}`) }
      ]
    );
  };

  const handleEmailPress = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleLocationPress = (address) => {
    // Open in maps (you can customize this based on your preference)
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  };

  return (
    <SafeAreaView style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <CustomHeader text={t('contact_us.title')} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('contact_us.get_in_touch')}
          </Text>
          <Text style={[styles.description, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('contact_us.description')}
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('contact_us.contact_info')}
          </Text>
          
          {/* Phone */}
          <TouchableOpacity 
            style={[styles.contactItem, { flexDirection: rowDirection }]}
            onPress={() => handleCallPress('+966501234567')}
          >
            {/* <Icons.Call width={wp(6)} height={wp(6)} style={styles.contactIcon} /> */}
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('contact_us.phone')}
              </Text>
              <Text style={[styles.contactValue, { textAlign: isRTL ? 'right' : 'left' }]}>
                +966 50 123 4567
              </Text>
            </View>
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity 
            style={[styles.contactItem, { flexDirection: rowDirection }]}
            onPress={() => handleEmailPress('support@care_on.com')}
          >
            {/* <Icons.Mail width={wp(6)} height={wp(6)} style={styles.contactIcon} /> */}
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('contact_us.email')}
              </Text>
              <Text style={[styles.contactValue, { textAlign: isRTL ? 'right' : 'left' }]}>
                support@care_on.com
              </Text>
            </View>
          </TouchableOpacity>

          {/* Location */}
          <TouchableOpacity 
            style={[styles.contactItem, { flexDirection: rowDirection }]}
            onPress={() => handleLocationPress('Riyadh, Saudi Arabia')}
          >
            {/* <Icons.Location width={wp(6)} height={wp(6)} style={styles.contactIcon} /> */}
            <View style={styles.contactTextContainer}>
              <Text style={[styles.contactLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('contact_us.location')}
              </Text>
              <Text style={[styles.contactValue, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('contact_us.address')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.hoursSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('contact_us.working_hours')}
          </Text>
          <View style={[styles.hoursContainer, { flexDirection: rowDirection }]}>
            <Text style={[styles.dayText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('contact_us.saturday')}
            </Text>
            <Text style={[styles.hoursText, { textAlign: isRTL ? 'right' : 'left' }]}>
              9:00 AM - 5:00 PM
            </Text>
          </View>
          <View style={[styles.hoursContainer, { flexDirection: rowDirection }]}>
            <Text style={[styles.dayText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('contact_us.sunday_to_thursday')}
            </Text>
            <Text style={[styles.hoursText, { textAlign: isRTL ? 'right' : 'left' }]}>
              8:00 AM - 6:00 PM
            </Text>
          </View>
          <View style={[styles.hoursContainer, { flexDirection: rowDirection }]}>
            <Text style={[styles.dayText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('contact_us.friday')}
            </Text>
            <Text style={[styles.hoursText, { textAlign: isRTL ? 'right' : 'left' }]}>
              8:00 AM - 12:00 PM
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  scrollContent: {
    padding: wp(4),
  },
  section: {
    marginBottom: hp(3),
    paddingHorizontal: wp(4),
  },
  sectionTitle: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: 'bold',
    color: '#1A1D44',
    marginBottom: hp(2),
  },
  description: {
    fontSize: Math.min(wp(4), 16),
    color: '#666',
    lineHeight: hp(3),
  },
  contactSection: {
    marginBottom: hp(4),
  },
  contactItem: {
    backgroundColor: '#fff',
    padding: wp(4),
    marginBottom: hp(2),
    borderRadius: wp(3),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIcon: {
    tintColor: '#014CC4',
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: wp(3),
  },
  contactLabel: {
    fontSize: Math.min(wp(3.5), 14),
    fontWeight: '600',
    color: '#666',
    marginBottom: hp(0.5),
  },
  contactValue: {
    fontSize: Math.min(wp(4), 16),
    fontWeight: '500',
    color: '#1A1D44',
  },
  hoursSection: {
    marginBottom: hp(4),
    paddingHorizontal: wp(4),
  },
  hoursContainer: {
    backgroundColor: '#fff',
    padding: wp(4),
    marginBottom: hp(1.5),
    borderRadius: wp(3),
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
  dayText: {
    fontSize: Math.min(wp(3.5), 14),
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  hoursText: {
    fontSize: Math.min(wp(3.5), 14),
    fontWeight: '500',
    color: '#1A1D44',
    flex: 2,
  },
});

export default ContactUs;
