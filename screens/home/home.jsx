// home.jsx - Fixed for Tablet + RTL

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '../../components/homeHeader';
import { Icons } from '../../components/Icons';
import SurveyPopup from '../../components/SurveyPopup';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const CHILD_AGE_LIMIT = 18;

const Home = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const { user, refreshToken } = useAuth();
  const [surveySkippedThisSession, setSurveySkippedThisSession] = useState(false);
  

  const menuItems = [
    { key: 'results', titleKey: 'home.results_title', icon: Icons.Analysis, navigateTo: 'results' },
    { key: 'eshaa', titleKey: 'home.xray_title', icon: Icons.Scan, navigateTo: 'eshaa' },
    { key: 'reports', titleKey: 'home.reports_title', icon: Icons.Scan, navigateTo: 'reports' },
    { key: 'medicines', titleKey: 'home.medicines_title', icon: Icons.Medicine, navigateTo: 'medicines' },
    { key: 'last', titleKey: 'home.last_reports_title', icon: Icons.Scan, navigateTo: 'last' },
  ];

  const age = useMemo(() => {
    const birthdate = user?.user?.resource?.birthdate;
    if (!birthdate) return null;
    try {
      const birthDate = new Date(birthdate);
      if (isNaN(birthDate.getTime())) return null;
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calculatedAge--;
      return calculatedAge;
    } catch {
      return null;
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refreshToken();
      const checkSurveyStatus = async () => {
        const userId = user?.user?.id;
        if (!userId) return;

        const surveyStatusKey = `hasCompletedSurvey_${userId}`;
        const hasCompletedSurvey = await AsyncStorage.getItem(surveyStatusKey);

        if (hasCompletedSurvey === 'true') {
          setSurveySkippedThisSession(false);
          return;
        }

        if (age !== null && age < CHILD_AGE_LIMIT) {
          setShowSurveyPopup(true);
        }
      };

      checkSurveyStatus();
    }, [user, age])
  );

  const handleTakeSurvey = async () => {
    setShowSurveyPopup(false);
    navigation.navigate('survey');
  };

  const handleSkipSurvey = () => {
    setShowSurveyPopup(false);
    setSurveySkippedThisSession(true);
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <HomeHeader />

      {surveySkippedThisSession && (
        <View style={styles.surveyReminderWrapper}>
          <TouchableOpacity
            style={[styles.surveyReminderContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            onPress={() => navigation.navigate('survey')}
          >
            <Image source={Images.alert} />
            <Text style={styles.surveyReminderText}>
              {t('home.complete_survey_prompt', { defaultValue: 'يرجي ملئ الاستبيان لاكمال بيانات الملف الشخصي' })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.menuContainer,{direction: isRTL ? 'rtl' : 'ltr'}]}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.secContainer}
            onPress={() => navigation.navigate(item.navigateTo)}
            activeOpacity={0.7}
          >
            <item.icon width={wp(7)} height={wp(7)} stroke="#000" />
            <Text style={styles.txt1}>{t(item.titleKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SurveyPopup
        visible={showSurveyPopup}
        onSkip={handleSkipSurvey}
        onTakeSurvey={handleTakeSurvey}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  menuContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  secContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: hp(1.2),
    padding: wp(4),
    borderRadius: wp(3),
    alignItems: 'center',
    gap: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  txt1: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: '500',
    flex: 1,
  },
  surveyReminderWrapper: {
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
  },
  surveyReminderContainer: {
    backgroundColor: '#F8444F',
    width: '100%',
    height: hp(5),
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    opacity: 0.95,
  },
  surveyReminderText: {
    color: '#000',
    fontWeight: '700',
    fontSize: Math.min(wp(3.5), 13),
    textAlign: 'center',
    flex: 1,
  },
});

export default Home;