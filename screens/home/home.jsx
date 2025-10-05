import { useNavigation } from '@react-navigation/native'

import { useTranslation } from 'react-i18next'
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HomeHeader } from '../../components/homeHeader'
import Images from '../../constants2/images'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const Home = () => {
  const navigation=useNavigation()
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* <PopUp/> */}
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
  }
})