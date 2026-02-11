import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Clipboard, Dimensions, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://dash.rayaa360.cloud';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const CreateCodeScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const createPatientAccessCode = async () => {
    try {
      setIsCreating(true);
      
      // Get auth token from user context
      const token = user?.token;
      const userId = user?.user?.id;
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('API_URL:', API_URL);
      console.log('Making API call to:', `${API_URL}/api/v1/patient-access-codes`);
      console.log('User ID:', userId);
      console.log('Token:', token);
      const response = await fetch(`${API_URL}/api/v1/patient-access-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        },
        body: JSON.stringify({
          // Add any required body data here
          patient_id: userId,
        }),
      });

      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', response.headers);

      const responseData = await response.json();
      console.log('API Response Data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      // Extract code from response - adjust based on actual API response structure
      const code = responseData.code || responseData.access_code || responseData.data?.code;
      if (!code) {
        throw new Error('No code returned from API');
      }

      setGeneratedCode(code.toString());
      setShowCode(true);
      
      // Show success alert with response details
      Alert.alert(
        t('create_code.success', { defaultValue: 'Success!' }),
        t('create_code.code_created', { defaultValue: `Code created successfully: ${code}` }),
        [
          {
            text: t('common.ok', { defaultValue: 'OK' }),
            onPress: () => console.log('Success alert dismissed'),
          },
        ]
      );

    } catch (error) {
      console.error('Error creating patient access code:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        user: userId,
        hasToken: !!token,
      });
      
      Alert.alert(
        t('create_code.error', { defaultValue: 'Error' }),
        t('create_code.failed_to_create', { defaultValue: `Failed to create code: ${error.message}` }),
        [
          {
            text: t('common.ok', { defaultValue: 'OK' }),
            onPress: () => console.log('Error alert dismissed'),
          },
        ]
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(generatedCode);
      Alert.alert(
        t('create_code.copied', { defaultValue: 'Copied!' }),
        t('create_code.code_copied', { defaultValue: 'Code copied to clipboard' }),
        [
          {
            text: t('common.ok', { defaultValue: 'OK' }),
            onPress: () => console.log('Copy success confirmed'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('create_code.error', { defaultValue: 'Error' }),
        t('create_code.copy_failed', { defaultValue: 'Failed to copy code' }),
        [
          {
            text: t('common.ok', { defaultValue: 'OK' }),
            onPress: () => console.log('Copy error confirmed'),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
     <CustomHeader text={'انشاء كود'}/>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {!showCode ? (
          /* Blue Border Box - Creation Interface */
          <View style={styles.codeBox}>
            {/* Circular Icon without Border */}
            <View style={styles.iconContainer}>
              <Image source={Images.createCodeG} style={styles.codeIcon} />
            </View>
            
            {/* Description Text */}
            <Text style={styles.descriptionText}>
              {t('create_code.code_description', { defaultValue: 'سيتم انشاء كود صالح لمدة ساعة واحدة' })}
            </Text>
            
            {/* Create Code Button */}
            <TouchableOpacity 
              style={[styles.createButton, isCreating && styles.createButtonDisabled]}
              onPress={createPatientAccessCode}
              disabled={isCreating}
            >
              <Text style={styles.createButtonText}>
                {isCreating 
                  ? t('create_code.creating', { defaultValue: 'جاري الانشاء...' })
                  : t('create_code.create_new_code', { defaultValue: 'انشئ كود جديد' })
                }
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Code Display Section */
          <View style={styles.codeDisplaySection}>
            <View style={styles.codeContainer}>
              <View style={styles.codeHeader}>
                <Text style={styles.codeTitle}>{t('create_code.your_code', { defaultValue: 'كودك الخاص' })}</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCode(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>
                  {generatedCode.split('').join(' ')}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={handleCopyCode}
              >
                <Image source={Images.download} style={styles.copyIcon} />
                <Text style={styles.copyButtonText}>{t('create_code.copy', { defaultValue: 'نسخ' })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

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
  codeBox: {
    width: wp(85),
    height: hp(38), 
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
  codeIcon: {
    width: wp(20),
    height: wp(20),
  },
  descriptionText: {
    fontSize: wp(4.8),
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
   marginBottom: hp(4),
    lineHeight: hp(3.5),
  },
  createButton: {
    backgroundColor: '#007AFF',
     width: wp(34),  // 132px responsive
    height: hp(4.5),  // 36px responsive


    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',

  },
  createButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: wp(4.5),
    fontWeight: '600',
  },
  // Code Display Section Styles
  codeDisplaySection: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
  },
  codeContainer: {
    backgroundColor: '#ffffff',
    borderRadius: wp(3),
    padding: wp(5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  },
  closeButton: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
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
    flexDirection: 'row',
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

export default CreateCodeScreen;
