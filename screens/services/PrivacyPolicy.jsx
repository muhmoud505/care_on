import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import useRTL from '../../hooks/useRTL';
import { hp, wp } from '../../utils/responsive';

const PrivacyPolicy = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useRTL();
  const { width } = useWindowDimensions();

  const [privacyData, setPrivacyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrivacyPolicy = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';
      const response = await fetch(`${API_URL}/api/v1/legal-pages/privacy-policy`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'lang': i18n.language,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch privacy policy');

      const json = await response.json();

      // Extract the nested `data` object from the API response
      if (json.success && json.data) {
        setPrivacyData(json.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Error fetching privacy policy:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacyPolicy();
  }, [i18n.language]); // Re-fetch when language changes

  // Custom styles for the rendered HTML
  const tagsStyles = {
    h2: {
      fontSize: Math.min(wp(5), 20),
      fontWeight: 'bold',
      color: '#1A1D44',
      marginTop: hp(2),
      marginBottom: hp(1),
      textAlign: isRTL ? 'right' : 'left',
    },
    p: {
      fontSize: Math.min(wp(3.5), 14),
      color: '#333',
      lineHeight: hp(2.5),
      textAlign: isRTL ? 'right' : 'left',
    },
    li: {
      fontSize: Math.min(wp(3.5), 14),
      color: '#333',
      lineHeight: hp(2.5),
      textAlign: isRTL ? 'right' : 'left',
    },
    strong: {
      fontWeight: '700',
      color: '#1A1D44',
    },
    ul: {
      marginBottom: hp(1.5),
      paddingLeft: isRTL ? 0 : wp(4),
      paddingRight: isRTL ? wp(4) : 0,
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

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{t('common.error_fetching_data')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPrivacyPolicy}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!privacyData) return null;

    return (
      <View style={[styles.contentWrapper, { direction: isRTL ? 'rtl' : 'ltr' }]}>
        {/* Title from API or fallback to localized title */}
        <Text style={[styles.pageTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
          {privacyData.title || t('privacy_policy.title')}
        </Text>

        {/* Render HTML content from API with localized styles */}
        <RenderHtml
          contentWidth={width - wp(8)}
          source={{ html: privacyData.content }}
          tagsStyles={tagsStyles}
        />

        {/* Last updated from API or fallback */}
        {privacyData.updated_at && (
          <Text style={[styles.updatedAt, { textAlign: isRTL ? 'left' : 'left' }]}>
            {t('privacy_policy.last_updated')}: {new Date(privacyData.updated_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <CustomHeader text={t('privacy_policy.title')} />
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
  errorText: {
    fontSize: Math.min(wp(4), 16),
    color: '#F44336',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  retryButton: {
    backgroundColor: '#014CC4',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: wp(3),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: Math.min(wp(4), 16),
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: 'bold',
    color: '#1A1D44',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  sectionText: {
    fontSize: Math.min(wp(3.5), 14),
    color: '#333',
    lineHeight: hp(2.5),
    marginBottom: hp(2),
  },
  updatedAt: {
    fontSize: Math.min(wp(3), 12),
    color: '#999',
    marginTop: hp(3),
    fontStyle: 'italic',
  },
});

export default PrivacyPolicy;