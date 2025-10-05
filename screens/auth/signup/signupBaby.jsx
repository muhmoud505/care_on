import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import DatePick from '../../../components/datePicker';

// isFormValid &&
const Signup2 = () => {
  const route=useRoute();
  const birthDate=useMemo(()=>{
     const date=route.params.date;
     return date
  },[])
  
  const navigation=useNavigation()
    const initialBirthDate = useMemo(() => route.params?.date || '', [route.params]);
    const [formData, setFormData] = useState({
    childName: '',
    nationalId: '',
    birthDate: initialBirthDate,
    birthCertificate: null
  });
  console.log('Received date:', birthDate);
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    console.log(formData.birthCertificate)
  },[])

   const isFormValid = useMemo(() => {
    return (
      formData.childName && 
      formData.nationalId && 
      formData.birthDate && 
      formData.birthCertificate
    );
  }, [formData]);
    useEffect(() => {
    if (initialBirthDate) {
      setFormData(prev => ({ ...prev, birthDate: initialBirthDate }));
    }
  }, [initialBirthDate]);

  console.log('Component rendered'); 

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
            value={formData.childName}
            onChangeText={(text) => handleFieldChange('childName', text)}
          />
          
          <FormField 
            required
            title={'الرقم القومي'}
            placeholder={'ادخل الرقم القومي للطفل'}
            value={formData.nationalId}
            onChangeText={(text) => handleFieldChange('nationalId', text)}
            keyboardType="numeric"
          />
          
         <DatePick
  required
  title={'تاريخ الميلاد'}
  placeholder={'ادخل تاريخ ميلاد الطفل'}
  value={formData.birthDate}
          onDateSelect={(date) => handleFieldChange('birthDate', date)}
/>
          </View>
          <View style={styles.v3}>
<Uploader
  required
  title={'شهادة ميلاد الطفل'}
  color='#80D28040'
  onFileSelect={(file) => {
    console.log('Selected file:', file); // Debug log
    if (file && file.uri) {
      handleFieldChange('birthCertificate', file.uri); // Store just URI if needed
    }
  }}
/>
            </View>
        
        <TouchableOpacity
  style={[styles.nextButton, isFormValid ? null : styles.disabledButton]}
  onPress={() =>  navigation.navigate('welcome')}
  activeOpacity={0.7}
  // disabled={!isFormValid}
>
  <Text style={styles.nextButtonText}>التالي</Text>
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
    padding: 16,
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
    marginBottom: 24,
  },
  nextButton: {
    backgroundColor: '#014CC4',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:50
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  v3:{
    marginRight:'90%'
  }
  
});

export default Signup2;