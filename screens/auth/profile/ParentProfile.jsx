import { Dimensions, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../../../components/CustomHeader';
import Images from '../../../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const ParentProfile = () => {
  const navigation = useNavigation();
  // TODO: Replace hardcoded data with dynamic user data from context or props
  return (
    <SafeAreaView  >
      <CustomHeader text={'الحساب الشخصي'}/>
      <View style={{direction:'rtl'}}>
        <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>الحسابات المرتبطة</Text>
          </TouchableOpacity>
        <View style={styles.cont1}>
          <View style={styles.info}>

          
           <Image
            source={Images.profile}
            style={styles.profileImg}
            />
          <View style={styles.ele1} >
          <Image
            source={Images.edit}
            />
          </View>
        </View>
        <View style={styles.info} >
        <Text style={styles.txt1} numberOfLines={1}>
          جيلان ايمن جلال محمود
        </Text>
        <Text style={styles.txt2}>
          2030xxxxxxxxxx
        </Text> 
        </View>
      </View>
      
      <View style={styles.cont3}>
        <Text>شهادة الميلاد</Text>
        <ImageBackground 
           source={Images.id}
             style={[styles.background, {width: wp(90)}]}
              imageStyle={{width:wp(90), height:hp(8),borderRadius:8}}
             resizeMode='cover'
         >
            <View style={styles.overlay}>
               <Image source={Images.download} />
                 <Text style={[styles.txt4,{color:'#fff'}]}>تنزيل</Text>
              </View>
        </ImageBackground>

      </View>
      <TouchableOpacity
          style={styles.nextButton}
         onPress={()=>router.push('/home')}
                     
      >
        <Text style={styles.nextButtonText}>اضافة حساب اخر</Text>
         </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('reset')}>
        <Text style={styles.link}>اعادة تعيين كلمة السر</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default ParentProfile

const styles = StyleSheet.create({

   info:{
    position:'relative',
    bottom: hp(8),
    flexDirection:'column',
    alignItems: 'center',
   },
  cont1:{
    alignItems:'center',
    flexDirection:'column',
    backgroundColor:'#fff',
    width:'90%',
    height: hp(15),
    marginTop: hp(5),
    marginHorizontal:'5%',
    borderRadius:12
  },
  btn:{
   width: wp(28),
   height: hp(4.5),
   borderRadius:8,
   backgroundColor:'#80D280',
   justifyContent:'center',
   alignItems:'center',
   position:'absolute',
   left: wp(4),
   top: hp(-0.6),
   zIndex: 1,
  },
  btnText:{
    color:'#FFFFFF',
    fontWeight:'700',
    fontSize: wp(2.5)
  }
  ,

  cont2:{
    alignItems:'center',
    flexDirection:'row',
    columnGap: wp(2.5),
    marginHorizontal: wp(5)
  },
  cont3:{
    direction:'rtl',
    margin: wp(5)
  },
  profileImg:{
    width: wp(32),
    height: wp(32),
    resizeMode:'contain'
  },
  ele1:{
    backgroundColor:'#FFFFFF',
    borderRadius: wp(5),
    width: wp(8.5),
    height: wp(8.5),
    justifyContent:'center',
    alignItems:'center',
    position:'absolute',
    top: hp(9),
  },
  ele2:{
    backgroundColor:'#014CC4',
    width: wp(12),
    height: wp(12),
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center'
  },  
  background: {
    height: hp(8),
    marginTop: hp(1.5),
    direction:'rtl'
  },
  overlay: {
    backgroundColor: '#00000080',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: wp(2.5),
    borderRadius: 12,
  },
  txt1:{
    fontSize: wp(3.5),
    fontWeight:'700',
  },
  txt2:{
    fontSize: wp(3.5),
    fontWeight:'500',
    color:'#999999'
  },
  txt3:{
    fontWeight:'700',
    fontSize: wp(5),
    color:'#FFFFFF'
  },
  txt4:{
    fontWeight:'500',
    fontSize: wp(3),
  },
  link:{
    fontSize: wp(3.5),
    fontWeight:'700',
    textDecorationLine:'underline',
    color:'black',
    marginHorizontal: wp(5)
  },
   nextButton: {
    backgroundColor: '#80D280',
    height: hp(6),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width:'90%',
    marginHorizontal:'5%',
    marginBottom: hp(1.5)
  },
    nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp(4),
  },
})