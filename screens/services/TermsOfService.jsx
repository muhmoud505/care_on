import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import useRTL from '../../hooks/useRTL';
import { hp, wp } from '../../utils/responsive';

const TermsOfService = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isRTL, rowDirection } = useRTL(); // Use reactive useRTL hook

  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTermsOfService = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch terms of service data from API with dynamic slug
        const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';
        const response = await fetch(`${API_URL}/api/v1/legal-pages/terms-of-service`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'lang': i18n.language,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch terms of service');
        }
        
        const data = await response.json();
        setTermsData(data);
      } catch (err) {
        console.error('Error fetching terms of service:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsOfService();
  }, []);

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <CustomHeader text={t('terms_of_service.title')} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.acceptance')}
          </Text>
          <Text style={[styles.description, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.acceptance_description')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.service_description')}
          </Text>
          <Text style={[styles.content, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.service_description_text')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.user_responsibilities')}
          </Text>
          <Text style={[styles.content, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.user_responsibilities_text')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.service_availability')}
          </Text>
          <Text style={[styles.content, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.service_availability_text')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.fees_and_payments')}
          </Text>
          <Text style={[styles.content, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.fees_and_payments_text')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.cancellation')}
          </Text>
          <Text style={[styles.content, { textAlign: isRTL ? 'right' : 'left' }]}>
            {termsData ? termsData.cancellation : t('terms_of_service.cancellation_text')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.privacy')}
          </Text>
          <Text style={[styles.content, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.privacy_text')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.intellectual_property')}
          </Text>
          <Text style={[styles.content, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.intellectual_property_text')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.disclaimer')}
          </Text>
          <Text style={[styles.content, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.disclaimer_text')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.contact')}
          </Text>
          <Text style={[styles.content, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('terms_of_service.contact_text')}
          </Text>
          <TouchableOpacity 
            style={[styles.contactButton, { flexDirection: rowDirection }]}
            onPress={() => handleLinkPress('mailto:support@care_on.com')}
          >
            {/* <Icons.Mail width={wp(6)} height={wp(6)} style={styles.contactIcon} /> */}
            <Text style={[styles.contactButtonText, { textAlign: isRTL ? 'center' : 'center' }]}>
              {t('terms_of_service.contact_support')}
            </Text>
          </TouchableOpacity>
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
  contentSection: {
    marginBottom: hp(3),
    paddingHorizontal: wp(4),
  },
  content: {
    fontSize: Math.min(wp(3.5), 14),
    color: '#333',
    lineHeight: hp(2.5),
    marginBottom: hp(1),
  },
  contactButton: {
    backgroundColor: '#014CC4',
    padding: wp(4),
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
    justifyContent: 'center',
  },
  contactIcon: {
    tintColor: '#fff',
    marginRight: wp(2),
  },
  contactButtonText: {
    color: '#fff',
    fontSize: Math.min(wp(4), 16),
    fontWeight: '500',
  },
});

export default TermsOfService;
