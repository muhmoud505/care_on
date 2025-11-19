import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useCallback, useMemo, useState } from 'react';
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
    display:'flex',
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