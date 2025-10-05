import { useNavigation } from "@react-navigation/native"
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomHeader from "../../components/CustomHeader"
import FormField from "../../components/FormInput"
import Images from '../../constants2/images'

const LocationFormScreen=()=>{
    const navigation=useNavigation()
    const { t } = useTranslation()
    const countries=['egypt']
    const cities=[ "القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "المنوفية", 
        "الشرقية","الغربية", "الدقهلية", "البحيرة", "كفر الشيخ"
         ,"دمياط" ,"بورسعيد", "الإسماعيلية", "السويس", "مطروح", "شمال سيناء"
         , "جنوب سيناء", "الفيوم", "بني سويف", "المنيا","أسيوط", "سوهاج", "قنا" ,
         "الأقصر", "أسوان", "البحر الأحمر","الوادي الجديد"]
    return(
        <SafeAreaView style={{direction:'rtl'}}>
          <CustomHeader text={t('services.nearest_service', { defaultValue: 'أقرب خدمة طبية' })}/>
            <ScrollView
            style={{ height: '100%' }}
            showsVerticalScrollIndicator={false}
               nestedScrollEnabled
             contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View
                style={{
                    flexDirection:'row',
                    columnGap:5,
                    marginHorizontal:10,
                    marginBottom:20
                }}
                >
                    <Image source={Images.location}
                        style={{tintColor:"#014CC4"}}
                    />
                    <Text
                    style={{color:"#014CC4"}}
                    >{t('services.share_location_prompt', { defaultValue: 'شارك موقعك الجغرافي للبحث عن اقرب خدمة طبية' })}</Text>
                </View>
                <FormField title={t('services.country', { defaultValue: 'البلد' })} required type={'drop'} data={countries} placeholder={t('services.select_country', { defaultValue: 'اختر البلد' })}/>
                <FormField title={t('services.governorate', { defaultValue: 'المحافظة' })} required type={'drop'} data={cities} placeholder={t('services.select_governorate', { defaultValue: 'اختر المحافظة' })}/>
                <FormField title={t('services.address', { defaultValue: 'العنوان' })} required type="long" placeholder={t('services.enter_detailed_address', { defaultValue: 'ادخل العنوان التفصيلي' })}/>
               
                <View
                    style={styles.btnsContainer}
                >

                 <TouchableOpacity
                          style={[styles.nextButton,{backgroundColor: "#80D280"}]}

                        
                                                onPress={()=>navigation.goBack()}

                                    
                     >
                       <Text style={styles.nextButtonText}>{t('common.save', { defaultValue: 'حفظ' })}</Text>
                        </TouchableOpacity>
                          <TouchableOpacity
                          style={[styles.nextButton,{backgroundColor: "#F8444F"}]}
                         onPress={()=>navigation.goBack()}
                                     
                      >
                        <Text style={styles.nextButtonText}>{t('common.skip', { defaultValue: 'تجاهل' })}</Text>
                         </TouchableOpacity>
                </View>
                
           </ScrollView>
           

        </SafeAreaView>
    )
}
const styles=StyleSheet.create({
     nextButton: {
   
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
    fontSize: 24,
  },
  btnsContainer:{
    top:100
  }
})
export default LocationFormScreen