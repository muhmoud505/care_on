import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import Images from '../../constants2/images';
import useRTL from '../../hooks/useRTL';
import { hp, wp } from '../../utils/responsive';

const ContactUs = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const rtl = useRTL();

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
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  };

  return (
    <SafeAreaView style={[styles.container, { direction: rtl.dir }]}>
      <CustomHeader text={t('contact_us.title')} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { textAlign: rtl.textAlign }]}>
            {t('contact_us.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { textAlign: rtl.textAlign }]}>
            {t('contact_us.subtitle')}
          </Text>
        </View>
        <View style={styles.cardsContainer}>
          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Image source={Images.location} style={styles.gridIcon} />
            </View>
            <Text style={[styles.cardTitle, { textAlign: rtl.textAlign }]}>
              {t('contact_us.location')}
            </Text>
            <Text style={[styles.cardDesc, { textAlign: rtl.textAlign }]}>
              {t('contact_us.location_desc')}
            </Text>
            <TouchableOpacity 
              style={styles.blueButton}
              onPress={() => handleLocationPress('Eagle St, Brisbane, QLD, 4000')}
            >
              <Text style={styles.buttonText}>Eagle St, Brisbane, QLD, 4000 1</Text>
            </TouchableOpacity>
          </View>

          {/* Email Card */}
          <View style={styles.card}>
            <View style={[styles.iconCircle, styles.emailIconBg]}>
              <Image source={Images.email} style={styles.gridIcon} />
            </View>
            <Text style={[styles.cardTitle, { textAlign: rtl.textAlign }]}>
              {t('contact_us.email')}
            </Text>
            <Text style={[styles.cardDesc, { textAlign: rtl.textAlign }]}>
              {t('contact_us.email_desc')}
            </Text>
            <TouchableOpacity 
              style={styles.greenButton}
              onPress={() => handleEmailPress('example@Raya360.com')}
            >
              <Text style={styles.buttonText}>example@Raya360.com</Text>
            </TouchableOpacity>
          </View>

          {/* Live Chat Card */}
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Image source={Images.verify} style={styles.gridIcon} />
            </View>
            <Text style={[styles.cardTitle, { textAlign: rtl.textAlign }]}>
              {t('contact_us.live_chat')}
            </Text>
            <Text style={[styles.cardDesc, { textAlign: rtl.textAlign }]}>
              {t('contact_us.chat_desc')}
            </Text>
            <TouchableOpacity style={styles.blueButton}>
              <Text style={styles.buttonText}>{t('contact_us.chat_button')}</Text>
            </TouchableOpacity>
          </View>

          {/* Phone Card */}
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Image source={Images.call} style={styles.gridIcon} />
            </View>
            <Text style={[styles.cardTitle, { textAlign: rtl.textAlign }]}>
              {t('contact_us.phone')}
            </Text>
            <Text style={[styles.cardDesc, { textAlign: rtl.textAlign }]}>
              {t('contact_us.phone_desc')}
            </Text>
            <TouchableOpacity 
              style={styles.blueButton}
              onPress={() => handleCallPress('+1234567890')}
            >
              <Text style={styles.buttonText}>+123 456 7890</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Illustration */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={Images.contactIllustration} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  scrollContent: {
    padding: wp(2),
    paddingBottom: hp(8),
  },
  headerSection: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(3),
    marginBottom: hp(2),
  },
  headerTitle: {
    fontSize: Math.min(wp(7), 28),
    fontWeight: 'bold',
    color: '#1A1D44',
    marginBottom: hp(1),
  },
  headerSubtitle: {
    fontSize: Math.min(wp(4), 16),
    color: '#666',
    lineHeight: hp(2.5),
  },
  cardsContainer: {
    padding: wp(3),
    gap: hp(2),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp(4),
    padding: wp(4),
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  emailIconBg: {
    backgroundColor: '#E8F8F5',
  },
  gridIcon: {
    width: wp(5),
    height: wp(5),
    tintColor: '#014CC4',
  },
  cardTitle: {
    fontSize: Math.min(wp(4), 16),
    fontWeight: 'bold',
    color: '#1A1D44',
    marginBottom: hp(0.5),
  },
  cardDesc: {
    fontSize: Math.min(wp(3.2), 13),
    color: '#666',
    marginBottom: hp(1.5),
    lineHeight: hp(2.2),
  },
  blueButton: {
    backgroundColor: '#2563EB',
    borderRadius: wp(2),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    width: '100%',
    alignItems: 'center',
  },
  greenButton: {
    backgroundColor: '#059669',
    borderRadius: wp(2),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: Math.min(wp(3), 12),
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: wp(6),
    padding: wp(5),
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: Math.min(wp(6), 24),
    fontWeight: 'bold',
    color: '#1A1D44',
    marginBottom: hp(1.5),
  },
  description: {
    fontSize: Math.min(wp(4), 16),
    color: '#666',
    lineHeight: hp(3),
    marginBottom: hp(3),
  },
  contactOptions: {
    gap: hp(2),
  },
  contactOption: {
    backgroundColor: '#F8FAFF',
    borderRadius: wp(4),
    padding: wp(4),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F0FE',
  },
  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  contactIcon: {
    width: wp(6),
    height: wp(6),
    tintColor: '#014CC4',
  },
  contactInfo: {
    flex: 1,
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
  hoursCard: {
    backgroundColor: '#fff',
    borderRadius: wp(6),
    padding: wp(5),
    marginBottom: hp(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: 'bold',
    color: '#1A1D44',
    marginBottom: hp(2),
  },
  hoursContainer: {
    backgroundColor: '#F8FAFF',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(1.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F0FE',
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
  illustrationContainer: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  illustration: {
    width: wp(80),
    height: hp(30),
  },
});

export default ContactUs;
