import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import useRTL from '../../hooks/useRTL';
import { hp, wp } from '../../utils/responsive';

const TermsOfService = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isRTL, rowDirection } = useRTL();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [termsData, setTermsData] = useState(null);

  const fetchTermsOfService = async () => {
    try {
      setLoading(true);

      const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';
      const response = await fetch(`${API_URL}/api/v1/legal-pages/terms-conditions`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'accept-language': i18n.language,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch terms of service');

      const json = await response.json();

      if (json.success && json.data) {
        setTermsData(json.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Error fetching terms of service:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTermsOfService();
  }, [i18n.language]);

  const tagsStyles = {
    h2: {
      fontSize: Math.min(wp(5), 20),
      fontWeight: 'bold',
      color: '#1A1D44',
      marginTop: hp(2.5),
      marginBottom: hp(1),
      textAlign: isRTL ? 'left' : 'right',
      borderBottomWidth: 1,
      borderBottomColor: '#E0EAFF',
      paddingBottom: hp(0.8),
    },
    p: {
      fontSize: Math.min(wp(3.8), 15),
      color: '#444',
      lineHeight: hp(3),
      textAlign: isRTL ? 'left' : 'right',
      marginBottom: hp(1),
    },
    ul: {
      marginBottom: hp(1.5),
      paddingLeft: isRTL ? 0 : wp(4),
      paddingRight: isRTL ? wp(4) : 0,
    },
    li: {
      fontSize: Math.min(wp(3.8), 15),
      color: '#444',
      lineHeight: hp(3),
      textAlign: isRTL ? 'left' : 'right',
      marginBottom: hp(0.5),
    },
    strong: {
      fontWeight: '700',
      color: '#014CC4',
    },
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#014CC4" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      );
    }

    if (!termsData) return null;

    return (
      <View style={[styles.contentWrapper, { direction: isRTL ? 'rtl' : 'ltr' }]}>
        <Text style={[styles.pageTitle, { textAlign: isRTL ? 'left' : 'right' }]}>
          {termsData.title || t('terms_of_service.title')}
        </Text>

        <RenderHtml
          contentWidth={width - wp(8)}
          source={{ html: termsData.content }}
          tagsStyles={tagsStyles}
          baseStyle={{
            direction: isRTL ? 'rtl' : 'ltr',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          }}
          renderersProps={{
            ul: {
              markerBoxStyle: {
                paddingRight: isRTL ? wp(2) : 0,
                paddingLeft: isRTL ? 0 : wp(2),
              },
            },
          }}
        />

        {termsData.updated_at && (
          <Text style={[styles.updatedAt, { textAlign: isRTL ? 'left' : 'right' }]}>
            {t('terms_of_service.last_updated')}: {new Date(termsData.updated_at).toLocaleDateString()}
          </Text>
        )}

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Linking.openURL('mailto:re3aya360@gmail.com')}
        >
          <Text style={[styles.contactButtonText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {i18n.language === 'ar' ? 'تواصل معنا عبر البريد الإلكتروني' : 'Contact us via email'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <CustomHeader text={t('terms_of_service.title')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderContent()}
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
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  loadingText: {
    marginTop: hp(1.5),
    fontSize: Math.min(wp(4), 16),
    color: '#666',
  },
  contentWrapper: {
    paddingHorizontal: wp(2),
  },
  pageTitle: {
    fontSize: Math.min(wp(6), 24),
    fontWeight: 'bold',
    color: '#014CC4',
    marginBottom: hp(2),
  },
  updatedAt: {
    fontSize: Math.min(wp(3), 12),
    color: '#999',
    marginTop: hp(3),
    fontStyle: 'italic',
  },
  contactButton: {
    backgroundColor: '#014CC4',
    padding: wp(4),
    borderRadius: wp(3),
    alignItems: 'center',
    marginTop: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: Math.min(wp(4), 16),
    fontWeight: '500',
  },
});

export default TermsOfService;