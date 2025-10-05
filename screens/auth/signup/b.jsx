import { useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import DatePick from '../../../components/datePicker'


const S2 = () => {
  const [selectedDate, setSelectedDate] = useState()
  const navigation=useNavigation()
  const handleSelectedData=(selectedDate)=>{
    setSelectedDate(selectedDate)
    console.log('date from screen1: ',selectedDate);
    
  }
   const handlePress = () => {
    console.log('date before navigate: ',selectedDate);
    
    navigation.navigate('signup2', { 
      date: selectedDate, // Your date data
      otherParam: 'some value' // Any other data you want to send
    });
  };
    // console.log(text);
    
  
  return (
    <SafeAreaView style={styles.safeContainer} className=' '>
     
     <View style={styles.v1} >
        <Text style={styles.txt1} >ادخل تاريخ ميلاد الطفل</Text>
        <DatePick 
         title={'تاريخ الميلاد'}
         required
         placeholder={'ادخل تاريخ ميلاد الطفل'}
         onDateSelect={handleSelectedData}
         
         />
     </View>
      <View style={styles.v2}>
        <TouchableOpacity 
         style={styles.btn1}
         onPress={()=>handlePress()}
         activeOpacity={0.7}
         
         >
         <Text style={styles.btntxt}>التالي</Text>
      </TouchableOpacity>
     
      </View>
      
    <StatusBar backgroundColor='#80D280' style='auto'/>
      
    </SafeAreaView>
  )
}

export default S2

const styles = StyleSheet.create({
  // w-[100%] h-[100%] bg-white flex items-center justify-start 
  safeContainer:{
    width:'100%',
    height:'100%',
    backgroundColor:'#fff',
    // alignItems:'center',
    
  },
  //  className='w-[300px] h-[300px]'
  img:{
    width:300,
    height:300
  },
  // className="items-center top-4"
  v1:{
    // alignItems:'center',
    alignItems:'flex-end'

    , top:40,
    marginRight:10,
    rowGap:30
  },
  txt1:{
    // className="font-bold -[3text2px] text-center  "
    fontWeight:'bold',
    fontSize:20,
    
  },
  // className='font-bold text-[26px] text-center'
  txt2:{
    fontWeight:'bold',
    fontSize:26,

  },
  // className="font-bold text-[20px] top-6"
  txt3:{
    fontWeight:'bold',
    fontSize:20,
    marginTop:15
  },
  // bg-[#014CC4] w-[327px] h-[56] rounded-[16px] gap-[10px] align-middle'
  btn1:{
    backgroundColor:'#014CC4',
    width:327,
    height:56,
    borderRadius:16,
    justifyContent:'center',
    alignItems:'center'
  },
  // className='text-white font-bold text-[24px] text-center '
  btntxt:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:24,
    
  },
  // className='bottom-[-120] gap-5'
  v2:{
    position:'absolute',
    rowGap:20,
    bottom:70,
    marginHorizontal:20
  }

})