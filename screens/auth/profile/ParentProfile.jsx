import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Link } from '@react-navigation/native'
import CustomHeader from '../../../components/CustomHeader'

const ParentProfile = () => {
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
            source={require('../../../assets2/images/profile.png')}
            style={styles.profileImg}
            />
          <View style={styles.ele1} >
          <Image
            source={require('../../../assets2/images/edit.png')}
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
           source={require('../../../assets2/images/id.jpg')}
             style={styles.background}
              imageStyle={{width:330, height:61,borderRadius:8}}
             resizeMode='cover'
         >
            <View style={styles.overlay}>
               <Image source={require('../../../assets2/images/download.png')} />
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
      <Link screen={'reset'}  style={[styles.link]}>اعادة تعيين كلمة السر</Link>
      </View>
    </SafeAreaView>
  )
}

export default ParentProfile

const styles = StyleSheet.create({



   info:{
    position:'relative',
    bottom:65,
    flexDirection:'column'

       
   },
  cont1:{
    alignItems:'center',
    flexDirection:'column',
    backgroundColor:'#fff',
    width:'90%',
    height:115,
    marginTop:40,
    marginHorizontal:'5%',
    borderRadius:12
    
  },
  btn:{
   width:105,
   height:35,
   borderRadius:8,
   backgroundColor:'#80D280',
   justifyContent:'center',
   alignItems:'center',
   position:'absolute',
   left:15,
   top:-5
   
  },
  btnText:{
    color:'#FFFFFF',
    fontWeight:700,
    fontSize:10
  }
  ,

  cont2:{
    alignItems:'center',
    flexDirection:'row',
    direction:'rtl',
    columnGap:10,
    marginHorizontal:20
    
  },
  cont3:{
    direction:'rtl',
    margin:20
   
  },
  profileImg:{
    width:120,
    height:120,
    resizeMode:'contain'
  },
  ele1:{
  
    backgroundColor:'#FFFFFF',
    borderRadius:'50%',
    width:33,
    height:33,
    justifyContent:'center',
    alignItems:'center',
    position:'absolute',
    
    top:70,
    


  },
  ele2:{
    backgroundColor:'#014CC4',
    width:48,
    height:48,
    borderRadius:12,
    justifyContent:'center',
    alignItems:'center'
  },  
  background: {
    width: 330,
    height: 61,
    marginTop: 10,
    direction:'rtl'
  },
  overlay: {
    backgroundColor: '#00000080',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    borderRadius: 12,
  },
  txt1:{
    fontSize:14,
    fontWeight:700,
    
  },
  txt2:{
    fontSize:14,
    fontWeight:500,
    color:'#999999'
  },
  txt3:{
    fontWeight:700,
    fontSize:20,
    color:'#FFFFFF'
  },
  txt4:{
    fontWeight:500,
    fontSize:12,
   
  },
  link:{
    fontSize:14,
    fontWeight:700,
    textDecorationLine:'underline',
    color:'black',
    marginHorizontal:20

  },
   nextButton: {
    backgroundColor: '#80D280',
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width:'90%',
    marginHorizontal:'5%',
    marginBottom:10
  
    
  },
    nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})