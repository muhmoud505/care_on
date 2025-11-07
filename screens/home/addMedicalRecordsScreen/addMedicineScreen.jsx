import { useNavigation } from '@react-navigation/native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/CustomHeader'

import DatePick from '../../../components/datePicker'
import FormField from '../../../components/FormInput'
import { useAuth } from '../../../contexts/authContext'
import { useMedicalRecords } from '../../../contexts/medicalRecordsContext'
import useForm from '../../../hooks/useForm'
import { hp, wp } from '../../../utils/responsive'



const addMedicineScreen = () => {
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
    console.log('User national number being sent:', user.user.resource.national_number);
    setIsSubmitting(true);

    const descriptionObject = {
      dosage: form.dosage,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    const payload = {
      user_national_number: user.user.resource.national_number,
      type: 'prescription',
      title: form.medicineName,
      description: JSON.stringify(descriptionObject),
    };

    const result = await addRecord(payload);
    setIsSubmitting(false);

    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert(t('common.error'), result.error);
    }
  };

  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      <CustomHeader text={t('home.medicines_title', { defaultValue: 'الادوية' })}/>
      <View style={styles.formContainer}>
        <Text style={[styles.txt,{textAlign:'right'}]}>{t('home.enter_following_data', { defaultValue: 'يرجي ادخال البيانات التالية' })} </Text>
        <FormField
          title={t('home.medicine_name', { defaultValue: 'اسم الدواء' })}
          placeholder={t('home.enter_medicine_name', { defaultValue: 'ادخل اسم الدواء' })}
          value={form.medicineName}
          onChangeText={(text) => handleChange('medicineName', text)}
          error={errors.medicineName}
          required
        />
        <FormField
          title={t('home.medicines.dosage', { defaultValue: 'الجرعة' })}
          placeholder={t('home.enter_dosage', { defaultValue: 'ادخل الجرعة' })}
          value={form.dosage}
          onChangeText={(text) => handleChange('dosage', text)}
          error={errors.dosage}
          required
        />
        <DatePick
          title={t('common.from', { defaultValue: 'من' })}
          required
          placeholder={t('home.enter_start_date', { defaultValue: 'ادخل تاريخ البداية' })} // Note: onDateChange is not a prop of DatePick, it should be onDateSelect
          value={form.startDate}
          onDateSelect={(date) => handleChange('startDate', date)}
          error={errors.startDate}
        />
        <DatePick
           title={t('common.to', { defaultValue: 'الي' })}
          required
          value={form.endDate}
          placeholder={t('home.enter_end_date', { defaultValue: 'ادخل تاريخ الانتهاء' })} // Note: onDateChange is not a prop of DatePick, it should be onDateSelect
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
            <Text style={styles.nextButtonText}>{t('common.save', { defaultValue: 'حفظ' })}</Text>
         )}
       </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default addMedicineScreen


const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: '#F8F8F8',
        textAlign:'right'
    },
    formContainer:{
      paddingHorizontal: wp(3),
      paddingTop: hp(2),
    },
     nextButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(90),
    alignSelf: 'center',
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