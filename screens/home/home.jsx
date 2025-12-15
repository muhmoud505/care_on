import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const { t, i18n } = useTranslation();
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const { user } = useAuth(); // Get the current user from the auth context
  const [surveySkippedThisSession, setSurveySkippedThisSession] = useState(false);

  const menuItems = [
    { key: 'results', titleKey: 'home.results_title', icon: Images.results, navigateTo: 'results' },
    { key: 'eshaa', titleKey: 'home.xray_title', icon: Images.eshaa, navigateTo: 'eshaa' },
    { key: 'reports', titleKey: 'home.reports_title', icon: Images.reports, navigateTo: 'reports' },
    { key: 'medicines', titleKey: 'home.medicines_title', icon: Images.medicine, navigateTo: 'medicines' },
    { key: 'last', titleKey: 'home.last_reports_title', icon: Images.last_reports, navigateTo: 'last' },
  ];

  const age = useMemo(() => {
    const birthdate = user?.user?.resource?.birthdate; // YYYY-MM-DD format
    if (!birthdate) {
      return null; // Cannot determine age
    }
    try {
      const birthDate = new Date(birthdate);
      if (isNaN(birthDate.getTime())) throw new Error('Invalid date');

      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      return calculatedAge;
    } catch (e) {
      console.error("Failed to calculate age from birthdate:", e);
      return null;
    }
  }, [user]);

  // This effect runs every time the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      const checkSurveyStatus = async () => {
        const userId = user?.user?.id; // Get the user's ID
        if (!userId) {
          return; // Can't check status without a user
        }

        try {
          // 1. Check AsyncStorage FIRST to see if the survey has already been completed.
          // This is more efficient as it avoids other checks if the survey is done.
          const surveyStatusKey = `hasCompletedSurvey_${userId}`;
          const hasCompletedSurvey = await AsyncStorage.getItem(surveyStatusKey);

          // If the survey has been completed, stop here. This was the missing check.
          if (hasCompletedSurvey === 'true') {
            // If the survey is complete, ensure the "skipped" banner is not shown.
            setSurveySkippedThisSession(false);
            return;
          }

          // 2. If not completed, check if they skipped it this session.
          if (surveySkippedThisSession) {
            return;
          }

          // 3. If not completed and not skipped, check if the user is a child.
          if (age !== null && age < CHILD_AGE_LIMIT) {
            // If all checks pass, show the popup.
            setShowSurveyPopup(true);
          }

        } catch (error) {
          console.error('Failed to check survey status from AsyncStorage', error);
        }
      };

      checkSurveyStatus();
    }, [user, surveySkippedThisSession, age]) // Dependencies for the callback
  );

  const handleTakeSurvey = async () => {
    // Simply hide the popup and navigate to the survey screen.
    // The survey completion status will be set on the survey screen itself after successful submission.
    setShowSurveyPopup(false);
    navigation.navigate('survey');
  };

  const handleSkipSurvey = () => {
    setShowSurveyPopup(false);
    setSurveySkippedThisSession(true); // Set the flag to true for this session
  };

  return (
    <SafeAreaView style={[styles.mainContainer, { direction: i18n.dir() }]}>
      
      <HomeHeader/>

      {surveySkippedThisSession && (
        <View style={styles.surveyReminderWrapper}>
         
          <TouchableOpacity
            style={styles.surveyReminderContainer}
            onPress={() => navigation.navigate('survey')}
          >
             <Image source={Images.alert}/>
            <Text style={styles.surveyReminderText}>{t('home.complete_survey_prompt', { defaultValue: 'يرجي ملئ الاستبيان لاكمال بيانات الملف الشخصي' })}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.secContainer}
          onPress={() => navigation.navigate(item.navigateTo)}
          activeOpacity={0.7}
        >
          <Image source={item.icon} />
          <Text style={styles.txt1}>{t(item.titleKey)}</Text>
        </TouchableOpacity>
      ))}

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
    backgroundColor:'#F5F9FF',
  },
  secContainer:{
    flexDirection:'row',
    backgroundColor: '#fff',
    marginVertical: hp(1.5),
    marginHorizontal: wp(5),
    gap: wp(5),
    alignItems: 'center',
    padding: wp(4),
    borderRadius: wp(3),
    // Adding a subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  txt1:{
    // Using a slightly bolder font weight for better readability
    fontWeight:'500',
    fontSize: Math.min(wp(5), 20),
    lineHeight: hp(4),
  },
  surveyReminderWrapper: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  surveyReminderContainer: {
    backgroundColor: '#F8444F',
    width: wp(87.2), // Responsive width equivalent to 327px on a standard screen
    height: hp(4.5), // Responsive height equivalent to 36px on a standard screen
    opacity: 0.6,// A light yellow background
    paddingHorizontal: wp(4), // Use horizontal padding instead of all-around padding
    borderRadius: wp(3),
 // An amber border
    flexDirection: 'row', // Align icon and text
    alignItems: 'center', // Vertically center content
    justifyContent: 'center',
    gap: wp(2), // Add space between the icon and the text
  },
  surveyReminderText: {
    color: '#000000', // A dark text color for readability
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
  },
})