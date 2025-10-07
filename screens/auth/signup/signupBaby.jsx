import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CustomHeader from '../../../components/CustomHeader';
import FormField from '../../../components/FormInput';
import Uploader from '../../../components/Uploader';

const Signup2 = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { birthdate, gender, age } = route.params || {};
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '', // Add email field for the parent/guardian
    national_number: '',
    birthCertificate: null,
  });

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const isFormValid = useMemo(() => {
    return (
      formData.name &&
      formData.email && // Ensure parent's email is provided
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
            title={'البريد الالكتروني للوالدين'}
            placeholder={'ادخل بريدك الالكتروني'}
            value={formData.email}
            onChangeText={(text) => handleFieldChange('email', text)}
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
    marginTop:StatusBar.currentHeight,
    paddingBottom: 40,
  },
  headerTextContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignSelf: 'center',
    maxWidth: 340,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  headerHighlight: {
    color: '#80D280',
  },
  formContainer: {
    // Container for FormField components
  },
  nextButton: {
    backgroundColor: '#014CC4',
    width: '90%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
});

export default Signup2;