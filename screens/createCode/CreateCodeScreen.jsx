import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Image, Modal, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const CreateCodeScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const createPatientAccessCode = async () => {
    try {
      setIsCreating(true);
      
      // Get auth token from user context
      const token = user?.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('API_URL:', API_URL);
      console.log('Making API call to:', `${API_URL}/api/v1/patient-access-codes`);
      
      const response = await fetch(`${API_URL}/api/v1/patient-access-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Add any required body data here
          patient_id: user?.user?.id,
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
      setShowCodeModal(true);
      
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
        user: user?.user?.id,
        hasToken: !!user?.token,
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

  const handleCopyCode = () => {
    // Simple alert showing the code for now
    Alert.alert(
      t('create_code.code_display', { defaultValue: 'Code' }),
      t('create_code.code_value', { defaultValue: `Your code is: ${generatedCode}` }),
      [
        {
          text: t('common.ok', { defaultValue: 'OK' }),
          onPress: () => console.log('Code displayed'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
     <CustomHeader text={'انشاء كود'}/>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Blue Border Box */}
        <View style={styles.codeBox}>
          {/* Circular Icon */}
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
      </View>

      {/* Code Display Modal */}
      <Modal
        visible={showCodeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('create_code.your_code', { defaultValue: 'كودك الخاص' })}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCodeModal(false)}
              >
                <Image source={Images.close} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            {/* Code Display */}
            <View style={styles.codeDisplayContainer}>
              <Text style={styles.codeText}>
                {generatedCode.split('').join(' ')}
              </Text>
            </View>

            {/* Copy Button */}
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={handleCopyCode}
            >
              <Image source={Images.download} style={styles.copyIcon} />
              <Text style={styles.copyButtonText}>{t('create_code.copy', { defaultValue: 'نسخ' })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: wp(85),  // Keep this or replace with: (327 / SCREEN_WIDTH) * 100
    height: hp(38), 
    borderRadius: wp(3),
      paddingVertical: hp(6),  
    paddingHorizontal: wp(8),
    alignItems: 'center',
    backgroundColor: '#ffffff',
        justifyContent: 'space-between', 
  },
  iconContainer: {
      marginBottom: hp(2), 
  },
  iconCircle: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    borderWidth: 4,
   
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(80),
    backgroundColor: '#ffffff',
    borderRadius: wp(2),
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    padding: wp(1),
  },
  closeIcon: {
    width: wp(4),
    height: wp(4),
    tintColor: '#ffffff',
  },
  codeDisplayContainer: {
    paddingVertical: hp(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  codeText: {
    fontSize: wp(10),
    fontWeight: '700',
    color: '#000000',
    letterSpacing: wp(3),
  },
  copyButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
    marginHorizontal: wp(4),
    marginBottom: hp(2),
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
