import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Images from '../constants2/images';

export const HomeHeader=()=>{
  const navigation=useNavigation()
  const { t } = useTranslation();
  return(
    <View style={styles.headerContainer}>
                <TouchableOpacity
                
                  onPress={()=>navigation.getParent()?.toggleDrawer()}
                >
                  <Image
                style={{width:24,height:24,}}
                  source={Images.menu}
                  
                />
                </TouchableOpacity>
                
                <View style={[{flexDirection:'row'}]}>
                  <Text style={[styles.txt1,{direction:'rtl'}]}>
                     {t('home.results.hello')} <Text style={styles.txt2}>2030xxxxxxxxxx</Text><Text style={{color:'#888888'}}>!</Text>
                  </Text>
                  <Image
                    source={Images.wave}
                    style={{marginLeft:10,marginRight:5}}
                  />
                </View>
                <Image
                  source={Images.notification}
                />
                <Image
                  style={styles.img}
                  source={Images.p}
                  
                />
                
              </View>
  )
}
const styles = StyleSheet.create({
  container:{
    backgroundColor:'#fff'
  },
  headerContainer: {
    flexDirection:'row',
    height: 100, // Set your desired header height
    backgroundColor: '#fff', // Header background color
    columnGap:10,
    alignItems: 'center',

    marginHorizontal:'7%'
    

  

   
  },
  txt1: {
    fontSize: 24,
    fontWeight: 'bold',
    color:'black'
  },
  txt2: {
    fontSize: 14,
    fontWeight: 'bold',
    color:'#888888'
  },
  img: {
    width: 40,
    height: 40,
    top:-5,
    left:2

  },
  survey:{
    flexDirection:'row-reverse',
    gap:20
  }
});