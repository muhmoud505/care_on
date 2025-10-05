import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomHeader from "../../components/CustomHeader"
import { PopUp } from "../../components/permissionPopUp"
import Images from '../../constants2/images'

const LocationScreen=()=>{
 const [expanded, setExpanded] = useState(false);
 const navigation=useNavigation();

       const handlePopUpexpand = ( isExpanded) => {
    setExpanded(prev => setExpanded(isExpanded)
    );
  };
    return(
        <SafeAreaView
           
        >
            <CustomHeader text={'أقرب خدمة طبية'}/>
            <View
                 style={{
                direction:'rtl',
                marginHorizontal:15

            }}

            >
                {
                    expanded&&(
                <PopUp 
                expanded={expanded}
                onExpandedChange={(isExpanded) => handlePopUpexpand( isExpanded)}
                
                />

                    )
                }
                 <View
                                    style={styles.cont2}
                                >
                                <Image
                                    source={Images.routing}
                                />
                                <Text
                                    style={styles.txt1}
                                >يرجي منح التطبيق اذن الوصول لموقعك باحدي الطريقتين</Text>
                            </View>
            
                         <TouchableOpacity
                             style={styles.cont3}
                             onPress={(e=>setExpanded(!expanded))}
                         >
                             <Image
                                 source={Images.gps}
                                 style={{tintColor:'#000000'}}
                             />
                             <Text
                                 style={[styles.txt1,{color:'#000000'}]}
                             >
                                 استخدم موقعك الحالي
                             </Text>
                         </TouchableOpacity>
                          <TouchableOpacity
                             style={styles.cont3}
                             onPress={()=>navigation.navigate('location2')}
                         >
                             <Image
                                 source={Images.location}
                                 style={{tintColor:'#000000'}}
                             />
                             <Text
                                 style={[styles.txt1,{color:'#000000'}]}
                             >
                                 ادخال يدوي لموقعك
                             </Text>
                         </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles=StyleSheet.create({
    cont2:{
        flexDirection:'row',
        alignItems:'center',
        columnGap:10,
        marginBottom:10
      
    },
    txt1:{
        fontSize:10,
        fontWeight:700,
        color:'#014CC4'
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
export default LocationScreen
