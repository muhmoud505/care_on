import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import FormField from "../../components/FormInput";

const ServiceScreen=()=>{
    const navigation=useNavigation()
    const gotLocation=false;
    return(
        <SafeAreaView style={{direction:'rtl'}}>
            <View
                style={styles.cont1}
            >

            <CustomHeader text={'أقرب خدمة طبية'}/>
            {
                gotLocation?(null):(
                    <TouchableOpacity 
                        style={styles.alarm}
                        onPress={()=>navigation.navigate('location')}
                    >
                        <Image
                            source={require('../../assets2/images/alarm.png')}
                        />
                        <Text 
                        style={styles.alarmTxt}
                        >
                            يرجي منح التطبيق اذن الوصول لموقعك
                        </Text>
                    </TouchableOpacity>
                )

                
            }
            <FormField 
                placeholder={'ابحث عن اقرب خدمة ...'}
                type={'search'}
                />    
                <View
                    style={styles.cont2}
                >
                <Image
                    source={require('../../assets2/images/routing.png')}
                />
                <Text
                    style={styles.txt1}
                >ترشيح لأقرب خدمات طبية بناءا علي موقعك الجغرافي</Text>
            </View>
            <TouchableOpacity
                style={styles.cont3}
                
            >
                <Image
                    source={require('../../assets2/images/reports.png')}
                    style={{tintColor:'#000000'}}
                />
                <Text
                    style={[styles.txt1,{color:'#000000'}]}
                >
                    أقرب دكاترة
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.cont3}
            >
                <Image
                    source={require('../../assets2/images/r2.png')}
                    style={{
                        tintColor:'#000000',
                        width:24,
                        height:24
                    }}
                />
                <Text
                    style={[styles.txt1,{color:'#000000'}]}
                >
                    أقرب معامل تحاليل
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.cont3}
            >
                <Image
                    source={require('../../assets2/images/eshaa.png')}
                    style={{tintColor:'#000000'}}
                />
                <Text
                    style={[styles.txt1,{color:'#000000'}]}
                >
                    أقرب معامل اشعة
                </Text>
            </TouchableOpacity>
            </ View>
            

        </SafeAreaView>
    )
}
const styles=StyleSheet.create({
    cont1:{
        marginHorizontal:15
        
    },
    alarm:{
        backgroundColor:'#F8444F',
        paddingHorizontal:10,
        height:36,
        flexDirection:'row',
        columnGap:10,
        opacity:0.5,
        alignItems:'center',
        width:327,
        borderRadius:8

    },
    alarmTxt:{
        fontWeight:900,
        fontSize:10
    },
    cont2:{
        flexDirection:'row',
        alignItems:'center',
        columnGap:10,
        opacity:0.5
    },
    txt1:{
        fontSize:10,
        fontWeight:700,
        color:'#014CC4'
    },
    cont3:{
        width:327,
        height:56,
        borderRadius:12,
        borderWidth:1,
        borderColor:'#EEEEEE',
        backgroundColor:'#FFFFFF',
        paddingHorizontal:10,
        flexDirection:'row',
        columnGap:10,
        alignItems:'center',
        marginTop:5
        
    }
})
export default ServiceScreen