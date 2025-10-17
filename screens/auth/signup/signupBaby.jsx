import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  // I18nManager, // Removed unsolicited import
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import Uploader from '../../../components/Uploader';
import { useAuth } from '../../../contexts/authContext'; // Using Auth context to get parent user

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const Signup2 = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { birthdate, gender, age, isParentAddingChild } = route.params || {};

  // Get parent user from global state (e.g., Redux).
  const { user: parentUser } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '', // This is for the child's unique email
    national_number: '',
    birthCertificate: null,
  });

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const isFormValid = useMemo(() => {
    return (
      formData.name &&
      formData.email && // Ensure child's email is provided
      formData.national_number &&
      formData.birthCertificate
    );
  }, [formData]);

  const handleNext = async () => {
    if (!isFormValid) return;

    setIsProcessing(true);
    try {
      const base64Image = await FileSystem.readAsStringAsync(formData.birthCertificate.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const signupData = {
        name: formData.name,
        email: formData.email,
        national_number: formData.national_number,
        birthdate: birthdate,
        age: age,
        gender: gender,
        isChild: true,
        id: base64Image, // Birth certificate image
        type: 'patient',
        // Add parent_id if a parent is creating this account.
        // The backend will use this to link the accounts.
        // Also, pass the flag along to the next screen.
        isParentAddingChild: isParentAddingChild,
        ...(isParentAddingChild && parentUser && { parent_id: parentUser.id }),
      };

      navigation.navigate('password', { signupData });
    } catch (err) {
      console.error("Failed to process image or navigate:", err);
      Alert.alert("Error", "Could not process the selected image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <CustomHeader text='إنشاء حساب' />
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>
            لإنشاء <Text style={styles.headerHighlight}>حساب طفلك</Text> يرجي ملئ البيانات التالية ..
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <FormField 
            title={'اسم الطفل'}
            placeholder={'ادخل اسم طفلك'}
            value={formData.name}
            onChangeText={(text) => handleFieldChange('name', text)}
          />
          
          <FormField 
            required
            title={'البريد الالكتروني للطفل'}
            placeholder={'ادخل البريد الالكتروني للطفل'}
            value={formData.email}
            onChangeText={(text) => handleFieldChange('email', text)}
            keyboardType="email-address"
          />

          <FormField 
            required
            title={'الرقم القومي'}
            placeholder={'ادخل الرقم القومي للطفل'}
            value={formData.national_number}
            onChangeText={(text) => handleFieldChange('national_number', text)}
            keyboardType="numeric"
          />
        </View>
        
        <Uploader
          required
          title={'شهادة ميلاد الطفل'}
          color='#80D28040'
          onFileSelect={(file) => handleFieldChange('birthCertificate', file)}
        />
        
        <TouchableOpacity
          style={[styles.nextButton, (!isFormValid || isProcessing) && styles.disabledButton]}
          onPress={handleNext}
          activeOpacity={0.7}
          disabled={!isFormValid || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>التالي</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingBottom: hp(5),
  },
  headerTextContainer: {
    marginTop: hp(2),
    marginBottom: hp(3),
    alignSelf: 'center',
    width: wp(90),
  },
  headerText: {
    fontSize: wp(5.5),
    fontWeight: 'bold',
    textAlign: 'right',
  },
  headerHighlight: {
    color: '#80D280',
  },
  formContainer: {
    gap: hp(2),
  },
  nextButton: {
    backgroundColor: '#014CC4',
    width: wp(90),
    height: hp(6.5),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: hp(4),
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp(6),
  },
});

export default Signup2;