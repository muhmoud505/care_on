import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import PopUp from "../../components/PopUp";
import Images from '../../constants2/images';
import { hp, wp } from "../../utils/responsive";

const LocationScreen=()=>{
    const [isPopUpVisible, setPopUpVisible] = useState(false);
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();

    const handleLocationGranted = (coords) => {
        // Navigate back to the previous screen and pass the location data
        navigation.navigate('service', { location: coords });
    };

    return(
        <SafeAreaView style={styles.safeArea}>
            <CustomHeader text={t('services.nearest_service_title', { defaultValue: 'أقرب خدمة طبية' })}/>
            <View style={[styles.container, { direction: i18n.dir() }]}>
                
                {isPopUpVisible && (
                    <PopUp 
                        expanded={isPopUpVisible}
                        onExpandedChange={setPopUpVisible}
                        onLocationGranted={handleLocationGranted}
                    />
                )}

                <View style={styles.promptContainer}>
                    <Image source={Images.routing} />
                    <Text style={styles.promptText}>
                        {t('services.location_permission_options_prompt', { defaultValue: 'يرجي منح التطبيق اذن الوصول لموقعك باحدي الطريقتين' })}
                    </Text>
                </View>
    
                <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => setPopUpVisible(true)}
                >
                    <Image source={Images.gps} style={styles.optionIcon} />
                    <Text style={styles.optionText}>
                        {t('services.use_current_location', { defaultValue: 'استخدم موقعك الحالي' })}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => navigation.navigate('location2')}
                >
                    <Image source={Images.location} style={styles.optionIcon} />
                    <Text style={styles.optionText}>
                        {t('services.enter_location_manually', { defaultValue: 'ادخال يدوي لموقعك' })}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles=StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        marginHorizontal: wp(4),
        paddingTop: hp(2),
        gap: hp(2),
    },
    promptContainer:{
        flexDirection:'row',
        alignItems:'center',
        gap: wp(3),
    },
    promptText:{
        fontSize: hp(1.8),
        fontWeight: '700',
        color:'#014CC4',
        flex: 1, // Allow text to wrap
    },
    optionButton:{
        height: hp(7),
        borderRadius: 12,
        borderWidth: 1,
        borderColor:'#EEEEEE',
        backgroundColor:'#FFFFFF',
        paddingHorizontal: wp(3),
        flexDirection:'row',
        gap: wp(3),
        alignItems:'center',
    },
    optionIcon: {
        tintColor: '#000000',
    },
    optionText: {
        fontSize: hp(1.8),
        fontWeight: '700',
        color: '#000000',
    },
})
export default LocationScreen
