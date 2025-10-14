import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from 'react-i18next';
import Eshaas from "../screens/home/eshaa";
import Home from "../screens/home/home";
import LastReports from "../screens/home/lastReports";
import Medicines from "../screens/home/medicines";
import Reports from "../screens/home/reports";
import Results from "../screens/home/results";
import Survey from "../screens/home/survey";

const Stack=createNativeStackNavigator();
export default function HomeStack(){
  const { t } = useTranslation();
  return(
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen component={Home} name='Home' options={{ title: t('marketing.health_in_pocket', { defaultValue: 'صحتك في جيبك' }) }} />
      <Stack.Screen component={Results} name='results' options={{ title: t('home.results_title', { defaultValue: 'نتائج التحاليل' }) }} />
      <Stack.Screen component={Eshaas} name='eshaa' options={{ title: t('home.xray_title', { defaultValue: 'الاشعة' }) }} />
      <Stack.Screen component={Reports} name='reports' options={{ title: t('home.reports_title', { defaultValue: 'تقارير الدكاترة' }) }} />
      <Stack.Screen component={LastReports} name='last' options={{ title: t('home.last_reports_title', { defaultValue: 'التقارير السابقة' }) }} />
      <Stack.Screen  component={Medicines} name='medicines' options={{ title: t('home.medicines_title', { defaultValue: 'الادوية' }) }} />
      <Stack.Screen component={Survey} name='survey' options={{ title: t('survey.title', { defaultValue: 'استبيان' }) }} />
    </Stack.Navigator>
  )
}