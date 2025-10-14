import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CustomHeader } from '../../components/CustomHeader'
import FormField from '../../components/FormInput'
import DatePick from '../../components/datePicker'
import { useMedicalRecords } from '../../contexts/medicalRecordsContext'
import useForm from '../../hooks/useForm'
import { hp, wp } from '../../utils/responsive'


const Add = () => {
  const navigation=useNavigation();
  const { addMedicine, loading } = useMedicalRecords();
  const { t, i18n } = useTranslation()
  const { form, errors, handleChange, checkFormValidity } = useForm({
    name: '',
    dosage: '',
    from: null,
    to: null,
  });

  const formIsValid = checkFormValidity();

  const handleSave = () => {
    if (!formIsValid) return;

    addMedicine(form);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      <CustomHeader text={t('home.medicines_title', { defaultValue: 'الادوية' })}/>
      <View style={styles.formContainer}>
        <Text style={[styles.txt,{textAlign:'right'}]}>{t('home.enter_following_data', { defaultValue: 'يرجي ادخال البيانات التالية' })} </Text>
        <FormField 
          title={t('home.medicine_name', { defaultValue: 'اسم الدواء' })}
          placeholder={t('home.enter_medicine_name', { defaultValue: 'ادخل اسم الدواء' })}
          value={form.name}
          onChangeText={(text) => handleChange('name', text)}
          error={errors.name}
        />
        <FormField
          title={t('home.medicines.dosage', { defaultValue: 'الجرعة' })}
          placeholder={t('home.enter_dosage', { defaultValue: 'ادخل الجرعة' })}
          value={form.dosage}
          onChangeText={(text) => handleChange('dosage', text)}
          error={errors.dosage}
        />  
        <DatePick
          title={t('common.from', { defaultValue: 'من' })}
          required
          placeholder={t('home.enter_start_date', { defaultValue: 'ادخل تاريخ البداية' })}
          onDateChange={(date) => handleChange('from', date)}
          error={errors.from}
        />
        <DatePick
           title={t('common.to', { defaultValue: 'الي' })}
          required
          placeholder={t('home.enter_end_date', { defaultValue: 'ادخل تاريخ الانتهاء' })}
          onDateChange={(date) => handleChange('to', date)}
          error={errors.to}
        />
        <TouchableOpacity
           style={[styles.nextButton, !formIsValid && styles.disabledButton]}
           onPress={handleSave}
           disabled={!formIsValid}
       >
         {loading.medicines ? (
            <ActivityIndicator color="#fff" />
         ) : (
            <Text style={styles.nextButtonText}>{t('common.save', { defaultValue: 'حفظ' })}</Text>
         )}
       </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Add

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