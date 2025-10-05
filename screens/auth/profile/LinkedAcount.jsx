import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../../components/CustomHeader'

const LinkedAcount = () => {
  return (
    <SafeAreaView style={{position:'relative'}}>
        <CustomHeader text={'الحسابات المرتبطة بحساب الأم'}/>
      <View style={styles.container}>
        <Image
         source={require('../../../assets2/images/profile.png')}
         style={styles.img}
        />
        <View>
            <Text style={styles.txt1} numberOfLines={1}>
          جيلان ايمن جلال محمود
        </Text>
        <Text style={styles.txt2}>
          2030xxxxxxxxxx
        </Text> 
        </View>
         <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>تمثيل المستخدم</Text>
          </TouchableOpacity>
      </View>
      <TouchableOpacity
          style={styles.nextButton}
         onPress={()=>router.push('/home')}
                     
      >
        <Text style={styles.nextButtonText}>اضافة حساب اخر</Text>
         </TouchableOpacity>
    </SafeAreaView>
  )
}

export default LinkedAcount

const styles = StyleSheet.create({
   container:{
      direction:'rtl',
      flexDirection:'row',
      columnGap:15,
      margin:20,
      backgroundColor:'#fff',
      justifyContent:'center',
      alignItems:'center',
      borderRadius:12
      
   },
    img:{
        width:60,
        height:60,
        
    },
    btn:{
   width:105,
   height:35,
   borderRadius:8,
   backgroundColor:'#014CC4',
   justifyContent:'center',
   alignItems:'center',
   
  },
  btnText:{
    color:'#FFFFFF',
    fontWeight:700,
    fontSize:10
  },
  txt1:{
    fontSize:12,
    fontWeight:700,
    
  },
  txt2:{
    fontSize:12,
    fontWeight:500,
    color:'#999999'
  },
   nextButton: {
    
    backgroundColor: '#80D280',
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width:'90%',
    marginHorizontal:'5%',
    bottom:'-100%',
    top:450
  
    
  },
    nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})