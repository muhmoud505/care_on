import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Check from '../../../components/check'
import FormField from '../../../components/FormInput'
import Uploader from '../../../components/Uploader'

const Survey = () => {
  return (
    <View style={styles.container}>
      <Check
         q='هل الطفل اتولد طبيعي ولا قيصري؟ '
         ans={["قيصري","طبيعي"]}
         required
      />
      <Check
         q='هل الطفل اتولد طبيعي ولا قيصري؟ '
         ans={["قيصري","طبيعي"]}
         required
      />
      <Check
         q='هل الطفل اتولد طبيعي ولا قيصري؟ '
         ans={["قيصري","طبيعي"]}
         required
      />
      <Check
         q='هل الطفل اتولد طبيعي ولا قيصري؟ '
         ans={["قيصري","طبيعي",'طبيعي']}
         required
      />
      <FormField
        title={'اذا كنت ترغب في مشاركة اي ملاحظات'}
        placeholder={'ملاحظات'}
        />
        <Uploader title={'اذا كنت ترغب في مشاركة اي ملف'}/>
          <TouchableOpacity
            onPress={()=>router.push('/home')}
            activeOpacity={0.7}
            style={styles.btn}
                    >
             <Text style={styles.txt}>ارسال</Text>
            </TouchableOpacity>
      
    </View>
  )
}

export default Survey

const styles = StyleSheet.create({
    container:{
        direction:'rtl',
        backgroundColor:'#fff',
        width:'100%',
        height:'100%',
        paddingHorizontal:20,
        rowGap:10
    },
    btn:{
      width:327,
      height:56,
      backgroundColor:'#80D280',
      borderRadius:16,
      alignItems:'center',
      justifyContent:'center'
    },
    txt:{
      fontSize:24,
      fontWeight:700,
     textAlign:'center',
     color:'#FFFFFF'
    }
   
})