import { Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../../components/CustomHeader';
import Images from '../../../constants2/images';
import { useAuth } from '../../../contexts/authContext';
import { hp, profileStyles as styles, wp } from './profileStyles';

const AgeDisplay = ({ value, label }) => (
  <View style={{ alignItems: 'center' }}>
    <View style={styles.ele2}>
      <Text style={styles.txt3}>{value}</Text>
    </View>
    <Text style={styles.txt4}>{label}</Text>
  </View>
);

const ChildProfile = () => {
  
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  // Safely access user data
  const fullName = user?.user?.name || 'User Name';
  const nationalId = user?.user?.resource?.national_number || '';
console.log(user);
  const birthdate = user?.user?.resource?.birthdate; // YYYY-MM-DD format

  // Mask the national ID, showing the first 4 digits
  const maskedNationalId = nationalId
    ? `${nationalId.substring(0, 4)}${'x'.repeat(nationalId.length - 4)}`
    : 'xxxx';

  const age = useMemo(() => {
    if (!birthdate) {
      return { years: 0, months: 0, days: 0 };
    }

    try {
      const birthDate = new Date(birthdate);
      if (isNaN(birthDate.getTime())) throw new Error('Invalid date');

      const today = new Date();

      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();
      
      if (days < 0) {
        months--;
        // Get the last day of the previous month
        const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
      }
      
      if (months < 0) {
        years--;
        months += 12;
      }
      return { years, months, days };
    } catch (error) {
      return { years: 0, months: 0, days: 0 };
    }
  }, [birthdate]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <CustomHeader text={t('profile.child_profile_title', { defaultValue: 'الحساب الشخصي' })} />
      <ScrollView contentContainerStyle={{ paddingBottom: hp(5),paddingTop:hp(2) }}>
        <View style={{ flex: 1 }}>
          <View>
            <TouchableOpacity style={styles.btn}>
              <Text style={styles.btnText}>{t('account.switch_to_parent', { defaultValue: 'انتقال لحساب الأم' })}</Text>
            </TouchableOpacity>
            <View style={styles.cont1}>
              <View style={styles.info}>
               <Image
                source={Images.profile}
                style={styles.profileImg}
                />
                <TouchableOpacity style={styles.ele1}>
                  <Image source={Images.edit} />
                </TouchableOpacity>
              </View>
              <View style={styles.info} >
                <Text style={styles.txt1} numberOfLines={1}>{fullName}</Text>
                <Text style={styles.txt2}>{maskedNationalId}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cont2}>
            <Text style={styles.txt1}>{t('profile.age_today', { defaultValue: 'العمر لليوم' })}</Text>
            <AgeDisplay value={age.days} label={t('common.day', { defaultValue: 'يوم' })} />
            <AgeDisplay value={age.months} label={t('common.month', { defaultValue: 'شهر' })} />
            <AgeDisplay value={age.years} label={t('common.year', { defaultValue: 'سنة' })} />
          </View>
          <View style={styles.cont3}>
            <View>
            <Text>{t('profile.birth_certificate', { defaultValue: 'شهادة الميلاد' })}</Text>
            <ImageBackground 
               source={Images.background}
                 style={[styles.background, {width: wp(90)}]}
                  imageStyle={{width:wp(90), height:hp(8),borderRadius:8}}
                 resizeMode='cover'
             >
                <View style={styles.overlay}>
                   <Image source={Images.download} />
                     <Text style={[styles.txt4,{color:'#fff'}]}>{t('common.download', { defaultValue: 'تنزيل' })}</Text>
                  </View>
            </ImageBackground>
            </View>
            <View></View>
            <Text>{t('profile.uploaded_file', { defaultValue: 'الملف المرفوع سابقا' })}</Text>
            <ImageBackground 
               source={Images.background}
                 style={[styles.background, {width: wp(90)}]}
                  imageStyle={{width:wp(90), height:hp(8),borderRadius:8}}
                 resizeMode='cover'
             >
                <View style={styles.overlay}>
                   <Image source={Images.download} />
                     <Text style={[styles.txt4,{color:'#fff'}]}>{t('common.download', { defaultValue: 'تنزيل' })}</Text>
                  </View>
            </ImageBackground>
  
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('reset')}>
            <Text style={styles.link}>{t('profile.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' })}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
AgeDisplay.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

export default ChildProfile
