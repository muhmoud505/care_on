import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clipboard,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/CustomHeader';
import { Icons } from '../../components/Icons';
import { useAuth } from '../../contexts/authContext';
import {
  showError,
  showNetworkError,
  showPermissionError,
  showServerError,
  showSuccess,
} from '../../utils/toastService';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const CreateCodeScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const { user, authFetch } = useAuth();

  const [isCreating, setIsCreating]       = useState(false);
  const [showCode, setShowCode]           = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const createPatientAccessCode = async () => {
    try {
      setIsCreating(true);
      const token  = user?.token;
      const userId = user?.user?.id;
      if (!token) throw new Error(t('common.unauthorized'));

      const response = await authFetch(`${API_URL}/api/v1/patient-access-codes`, {
        method: 'POST',
        body: JSON.stringify({ patient_id: userId }),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || `HTTP error! status: ${response.status}`);

      const code = responseData.code || responseData.access_code || responseData.data?.code;
      if (!code) throw new Error(t('create_code.no_code_returned'));

      setGeneratedCode(code.toString());
      setShowCode(true);

      showSuccess(
        t('common.success'),
        t('create_code.code_created_success'),
        t,
        { duration: 3000 }
      );
    } catch (error) {
      // Enhanced error handling for code creation
      if (error.message?.includes('Network request failed') || error.message?.includes('network') || error.message?.includes('fetch')) {
        showNetworkError(
          t('create_code.code_network_error'),
          () => createPatientAccessCode(), // Retry function
          t
        );
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized') || error.message?.includes('403')) {
        showPermissionError(
          t('create_code.code_permission_error'),
          t,
          { duration: 4000 }
        );
      } else if (error.message?.includes('server') || error.message?.includes('500') || error.message?.includes('502')) {
        showServerError(
          t('create_code.code_server_error'),
          t,
          { duration: 4000 }
        );
      } else if (error.message?.includes('duplicate') || error.message?.includes('exists') || error.message?.includes('409')) {
        showError(
          t('create_code.code_duplicate_error'),
          error.message || t('common.something_went_wrong'),
          t,
          { duration: 4000 }
        );
      } else if (error.message?.includes('format') || error.message?.includes('invalid')) {
        showError(
          t('create_code.code_invalid_format'),
          error.message || t('common.something_went_wrong'),
          t,
          { duration: 4000 }
        );
      } else {
        showError(
          t('create_code.code_creation_failed'),
          error.message || t('common.something_went_wrong'),
          t,
          { duration: 4000 }
        );
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setString(generatedCode);
      showSuccess(
        t('create_code.copied'),
        t('create_code.code_copy_success'),
        t,
        { duration: 2000 }
      );
    } catch (error) {
      showError(
        t('common.error'),
        t('create_code.code_copy_failed'),
        t,
        { duration: 3000 }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <CustomHeader text={t('create_code.title')} />

      <View style={styles.mainContent}>
        {!showCode ? (
          <View style={styles.creationBox}>
            <View style={styles.iconContainer}>
              <Icons.Code width={wp(20)} height={wp(20)} />
            </View>

            <Text style={styles.descriptionText}>
              {t('create_code.code_description')}
            </Text>

            {/* ✅ No fixed width — button grows with text in any language */}
            <TouchableOpacity
              style={[styles.createButton, isCreating && styles.createButtonDisabled]}
              onPress={createPatientAccessCode}
              disabled={isCreating}
            >
              <Text style={styles.createButtonText} numberOfLines={1}>
                {isCreating ? t('create_code.creating') : t('create_code.create_new_code')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.codeDisplaySection}>
            <View style={styles.codeContainer}>

              <TouchableOpacity
                style={[styles.closeButton, { [isRTL ? 'left' : 'right']: wp(2) }]}
                onPress={() => setShowCode(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>

              <Text style={styles.codeTitle}>{t('create_code.your_code')}</Text>

              <View style={styles.codeBox}>
                <Text style={styles.codeText}>
                  {/* {generatedCode.split('').join(' ')} */}
                  {generatedCode}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.copyButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                onPress={handleCopyCode}
              >
                <Icons.Download width={wp(4)} height={wp(4)} style={styles.copyIcon} />
                <Text style={styles.copyButtonText}>{t('create_code.copy')}</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}
      </View>

      <Toast />
    </SafeAreaView>
  );
};

export default CreateCodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },

  /* Creation box */
  creationBox: {
    width: wp(85),
    borderRadius: wp(3),
    paddingVertical: hp(6),
    paddingHorizontal: wp(8),
    alignItems: 'center',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: hp(2),
  },
  descriptionText: {
    fontSize: wp(4.8),
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: hp(4),
    lineHeight: hp(3.5),
  },
  // ✅ KEY FIX: paddingHorizontal drives size — button never clips its label
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: wp(8),
    paddingVertical: hp(1.5),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: wp(42),           // enough for "Create New Code" in one line
  },
  createButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: wp(4),
    fontWeight: '600',
  },

  /* Code display */
  codeDisplaySection: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
    width: '100%',
  },
  codeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: wp(3),
    padding: wp(5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  codeTitle: {
    fontSize: wp(5),
    fontWeight: '600',
    color: '#000000',
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  closeButton: {
    position: 'absolute',
    top: wp(2),
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: wp(6),
    fontWeight: '600',
    color: '#666666',
  },
  codeBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(3),
    alignItems: 'center',
    width: '100%',
  },
  codeText: {
    fontSize: wp(8),
    fontWeight: '700',
    color: '#000000',
    letterSpacing: wp(2),
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: '#007AFF',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
    borderRadius: wp(2),
    gap: wp(1.5),
  },
  copyIcon: {
    width: wp(4),
    height: wp(4),
    tintColor: '#ffffff',
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: wp(4),
    fontWeight: '600',
  },
});
