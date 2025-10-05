import { useNavigation } from "@react-navigation/native"
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomHeader from "../../components/CustomHeader"
import Images from '../../constants2/images'

const PaymentStatus=()=>{
    const navigation=useNavigation()
    const { t } = useTranslation()
    return(
        <SafeAreaView style={{direction:'rtl'}}>
            <CustomHeader text={t('payment.details', { defaultValue: 'تفاصيل المعاملة' })}/>
            <View style={styles.mainContainer}>
                <View style={styles.cont1}>
                      <Image source={Images.success}/>
                <Text style={styles.txt1}>10 EGP</Text>
                </View>
                <View style={[styles.cont2,{
                    padding:20
                }]}>
                     <Image source={Images.pay}/>
                    <View 
                     style={{
                        rowGap:10
                     }}
                    >
                        <View style={styles.cont2}>
                            <Text style={styles.txt2}>{t('payment.to', { defaultValue: 'الي' })}</Text>
                            <Text style={[styles.txt2,{color:'#000'}]}>0123456789</Text>
                        </View>
                        <Text style={[styles.txt2,{color:'#000'}]}>
                            جيلان ا*** ج*** م****
                        </Text>
                    </View>
                </View>
                <View style={{
                    rowGap:20,
                    backgroundColor:'#FFF',
                    padding:10,
                    borderRadius:12


                }}>
                    <View style={styles.cont3}>
                        <Text style={styles.txt2}>{t('payment.reference_number', { defaultValue: 'الرقم المرجعي' })}</Text>
                        <Text style={[styles.txt2,{color:'#000'}]}>1234ggxyz</Text>
                    </View>
                    <View style={styles.cont3} >
                        <Text style={styles.txt2}>{t('payment.date', { defaultValue: 'التاريخ' })}</Text>
                        <Text style={[styles.txt2,{color:'#000'}]}>12 Jul 2025 05:47 PM</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.btn}
                    onPress={()=>{navigation.goBack()}}
                    activeOpacity={0.5}
                >
                    <Text style={styles.txt3}>
                        رجوع
                    </Text>
                </TouchableOpacity>
            </View>
            
            </SafeAreaView>
    )
}
const styles=StyleSheet.create({
    mainContainer:{
        paddingHorizontal:30,
        rowGap:10
    },
    txt1:{
        fontWeight:700,
        fontSize:24
    },
    cont1:{
        justifyContent:'center',
        alignItems:'center',
        rowGap:20
    },

    cont2:{
        flexDirection:'row',
        columnGap:30,
        backgroundColor:'#fff',
        borderRadius:12
        
    },
    cont3:{
        flexDirection:'row',
        columnGap:30,
        justifyContent:'space-between'
    },
    txt2:{
        fontSize:12,
        fontWeight:400,
        color:'#808080'
    },
    btn:{
        width:327,
        height:56,
        backgroundColor:'#014CC4',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:16,
        position:'absolute',
        bottom:'-115%',
        left:'5%'

    },
    txt3:{
        color:'#FFF',
        fontSize:24,
        fontWeight:700
    }
})
export default PaymentStatus