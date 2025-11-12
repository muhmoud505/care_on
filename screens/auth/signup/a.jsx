import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hp, wp } from '../../../utils/responsive';


const S1 = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeContainer} >
      <Image style={styles.img} source={require('../../../assets2/images/img1.png')}/>
     <View style={styles.v1} >
      <Text style={styles.txt1} >
        {t('marketing.health_in_pocket_part1')} <Text style={styles.txt2}>{t('marketing.health_in_pocket_part2')}</Text> {t('marketing.health_in_pocket_part3')}
      </Text>
      <Text style={styles.txt3}>{t('marketing.anytime_anywhere')}</Text>
    </View>
      <View style={styles.v2}>
        <TouchableOpacity 
         style={styles.btn1}
         onPress={() => navigation.navigate('signin')}
         activeOpacity={0.7}
         
         >
         <Text style={styles.btntxt}>{t('auth.signin')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn1,{backgroundColor:'#80D280'}]}
        onPress={() => navigation.navigate('s2')}
         activeOpacity={0.7}
      >
          
         <Text style={styles.btntxt}>{t('auth.signup')}</Text>
      </TouchableOpacity>
      </View>
      
    <StatusBar backgroundColor='#80D280' style='auto'/>
      
    </SafeAreaView>
  )
}

export default S1

const styles = StyleSheet.create({
  // w-[100%] h-[100%] bg-white flex items-center justify-start 
  safeContainer:{
    flex: 1,
    backgroundColor:'#fff',
    alignItems:'center',
    justifyContent: 'space-around',
  },
  //  className='w-[300px] h-[300px]'
  img:{
    width: wp(80),
    height: wp(80),
    resizeMode: 'contain',
  },
  // className="items-center top-4"
  v1:{
    alignItems:'center',
  },
  txt1:{
    // className="font-bold -[3text2px] text-center  "
    fontWeight:'bold',
    fontSize: Math.min(wp(8), 32),
  },
  // className='font-bold text-[26px] text-center'
  txt2:{
    fontWeight:'bold',
    fontSize: Math.min(wp(6.5), 26),
  },
  // className="font-bold text-[20px] top-6"
  txt3:{
    fontWeight:'bold',
    fontSize: Math.min(wp(5), 20),
    marginTop: hp(2),
  },
  // bg-[#014CC4] w-[327px] h-[56] rounded-[16px] gap-[10px] align-middle'
  btn1:{
    backgroundColor:'#014CC4',
    width: wp(85),
    height: hp(7),
    borderRadius: wp(4),
    justifyContent:'center',
    alignItems:'center'
  },
  // className='text-white font-bold text-[24px] text-center '
  btntxt:{
    color:'#fff',
    fontWeight:'bold',
    fontSize: Math.min(wp(6), 24),
  },
  // className='bottom-[-120] gap-5'
  v2:{
    width: '100%',
    alignItems: 'center',
    rowGap: hp(2.5),
  }

})