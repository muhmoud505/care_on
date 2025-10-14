import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '../../components/homeHeader';
import SurveyPopup from '../../components/SurveyPopup';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const CHILD_AGE_LIMIT = 18; // Define the age limit for a child account

const Home = () => {
  const navigation=useNavigation()
  const { t } = useTranslation();
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const { user } = useAuth(); // Get the current user from the auth context
  useEffect(() => {
    const checkSurveyStatus = async () => {
      console.log('hi');
      
      // Safely access the user's age using optional chaining.
      const age = user?.data?.user?.resource?.age;
      const userId = user?.data?.user?.id; // Get the user's ID
      console.log(userId);
      console.log(age);
      
      
      // Only proceed if the user is logged in and their age is below the limit.
      if (!userId || !age || age >= CHILD_AGE_LIMIT) {
        return;
      }
      console.log('hi2');
      

      // Create a user-specific key for AsyncStorage
      const surveyStatusKey = `hasCompletedSurvey_${userId}`;
      console.log(surveyStatusKey);
      
      try {
        // Check if the survey has already been completed by this user.
        const hasCompletedSurvey = await AsyncStorage.getItem(surveyStatusKey);
        
        
        if (hasCompletedSurvey !== 'true') {
          // If the survey is not completed, show the popup.
          setShowSurveyPopup(true);
        }
      } catch (error) {
        console.error('Failed to check survey status from AsyncStorage', error);
      }
    };

    checkSurveyStatus();
  }, [user]); // Re-run this effect if the user object changes

  const handleTakeSurvey = async () => {
    const userId = user?.data?.user?.id;
    if (!userId) return; // Don't proceed if there's no user ID

    const surveyStatusKey = `hasCompletedSurvey_${userId}`;

    setShowSurveyPopup(false);
    try {
      await AsyncStorage.setItem(surveyStatusKey, 'true');
    } catch (error) {
      console.error('Failed to save survey status to AsyncStorage', error);
    }
    navigation.navigate('survey');
  };

  const handleSkipSurvey = () => {
    setShowSurveyPopup(false);
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      
      <HomeHeader/>
      
      <TouchableOpacity style={styles.secContainer}
       onPress={()=>navigation.navigate('results')}
      >
        <Image source={Images.results} />
        <Text style={styles.txt1}>{t('home.results_title', { defaultValue: 'نتائج التحاليل' })}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
      style={styles.secContainer}
       onPress={()=>navigation.navigate('eshaa')}
      
      >
        <Image source={Images.eshaa} />
        <Text style={styles.txt1}>{t('home.xray_title', { defaultValue: 'الاشعة' })}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
      style={styles.secContainer}
       onPress={()=>navigation.navigate('reports')}
       activeOpacity={0.7}
      
      >
        <Image source={Images.reports} />
        <Text style={styles.txt1}>{t('home.reports_title', { defaultValue: 'تقارير الدكاترة' })}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
      style={styles.secContainer}
       onPress={()=>navigation.navigate('medicines')}
      
      >
        <Image source={Images.medicine} />
        <Text style={styles.txt1}>{t('home.medicines_title', { defaultValue: 'الادوية' })}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secContainer}
        onPress={()=>navigation.navigate('last')}
      >
        <Image source={Images.last_reports} />
        <Text style={styles.txt1}>{t('home.last_reports_title', { defaultValue: 'التقارير السابقة' })}</Text>
      </TouchableOpacity>
  

      <SurveyPopup
        visible={showSurveyPopup}
        onSkip={handleSkipSurvey}
        onTakeSurvey={handleTakeSurvey}
      />
      
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  mainContainer:{
    flex:1,
    display:'flex',
    direction:'rtl',
    backgroundColor:'#fff',
    
    
  },
  secContainer:{
    display:'flex',
    flexDirection:'row',
    marginVertical: hp(2),
    marginHorizontal: wp(10),
    gap: wp(5),
    alignItems: 'center'
  },
  txt1:{
    fontWeight:400,
    fontSize: Math.min(wp(5), 20),
    lineHeight: hp(4),
  },
})