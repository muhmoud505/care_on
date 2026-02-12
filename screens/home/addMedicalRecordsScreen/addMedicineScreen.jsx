import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../../components/CustomHeader';

import DatePick from '../../../components/datePicker';
import FormField from '../../../components/FormInput';
import { useAuth } from '../../../contexts/authContext';
import { useMedicalRecords } from '../../../contexts/medicalRecordsContext';
import useForm from '../../../hooks/useForm';
import { hp, wp } from '../../../utils/responsive';



const AddMedicineScreen = () => {
  const navigation=useNavigation();
  const { addRecord } = useMedicalRecords();
  const { user } = useAuth();
  const { t, i18n } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { form, errors, handleChange, checkFormValidity } = useForm({
    medicineName: '',
    dosage: '',
    startDate: null,
    endDate: null,
  });

  const formIsValid = checkFormValidity();

  const handleSave = async () => {
    if (!formIsValid) return;
    setIsSubmitting(true);

    const descriptionObject = {
      dosage: form.dosage,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    const payload = {
      type: 'prescription',
      title: form.medicineName,
      description: JSON.stringify(descriptionObject),
    };

    const result = await addRecord(payload);
    setIsSubmitting(false);

    if (result.success) {
      navigation.goBack();
    } else {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: result.error,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      <CustomHeader text={t('add_medicine.title')}/>
      <View style={styles.formContainer}>
        <Text style={[styles.txt,{textAlign:'right'}]}>{t('add_medicine.enter_following_data')} </Text>
        <FormField
          title={t('add_medicine.medicine_name')}
          placeholder={t('add_medicine.medicine_name_placeholder')}
          value={form.medicineName}
          onChangeText={(text) => handleChange('medicineName', text)}
          error={errors.medicineName}
          required
        />
        <FormField
          title={t('add_medicine.dosage')}
          placeholder={t('add_medicine.dosage_placeholder')}
          value={form.dosage}
          onChangeText={(text) => handleChange('dosage', text)}
          error={errors.dosage}
          required
        />
        <DatePick
          title={t('add_medicine.start_date')}
          required
          placeholder={t('add_medicine.start_date_placeholder')}
          value={form.startDate}
          onDateSelect={(date) => handleChange('startDate', date)}
          error={errors.startDate}
        />
        <DatePick
           title={t('add_medicine.end_date')}
          required
          value={form.endDate}
          placeholder={t('add_medicine.end_date_placeholder')}
          onDateSelect={(date) => handleChange('endDate', date)}
          error={errors.endDate}
        />
        <TouchableOpacity
           style={[styles.nextButton, !formIsValid && styles.disabledButton]}
           onPress={handleSave}
           disabled={!formIsValid || isSubmitting}
       >
         {isSubmitting ? (
            <ActivityIndicator color="#fff" />
         ) : (
            <Text style={styles.nextButtonText}>{t('common.save')}</Text>
         )}
       </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default AddMedicineScreen


const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: '#F8F8F8',
        textAlign:'right'
    },
    formContainer:{
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
    },
     nextButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center', // These properties are now handled by the container
    alignItems: 'center', // and the button's own padding/margin
    marginTop: hp(5)
  },
  disabledButton: {
    opacity: 0.5,
  },
    nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(6), 24),
  },
  txt:{
    fontWeight:'700',
   fontSize: Math.min(wp(5), 20),
   marginBottom: hp(2)
  }
})