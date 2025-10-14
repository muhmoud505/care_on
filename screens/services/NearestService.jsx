import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../components/CustomHeader";
import FormField from "../../components/FormInput";
import Images from "../../constants2/images";
import { hp, wp } from "../../utils/responsive";

const ServiceScreen=()=>{
    const navigation=useNavigation()
    const route = useRoute();
    const { t, i18n } = useTranslation();
    const [gotLocation, setGotLocation] = useState(false);

    useEffect(() => {
        if (route.params?.location) {
            console.log("Received location in ServiceScreen:", route.params.location);
            setGotLocation(true);
            // You can now use the coordinates: route.params.location.latitude, etc.
            // To clear the param and prevent re-triggering:
            navigation.setParams({ location: null });
        }
    }, [route.params?.location]);

    const handleNavigateToServiceList = (serviceType) => {
        // Navigate to a generic list screen, passing the type of service to display
        // You would need to create this 'ServiceList' screen.
        navigation.navigate('ServiceList', { serviceType, userLocation: route.params?.location });
    };

    return(
        <SafeAreaView style={[styles.safeArea, { direction: i18n.dir() }]}>
            <View style={styles.container}>
                <CustomHeader text={t('services.nearest_service_title', { defaultValue: 'أقرب خدمة طبية' })}/>
                
                {!gotLocation && (
                    <TouchableOpacity 
                        style={styles.alarm}
                        onPress={() => navigation.navigate('location')}
                    >
                        <Image source={Images.alarm} />
                        <Text style={styles.alarmTxt}>
                            {t('services.location_permission_prompt', { defaultValue: 'يرجي منح التطبيق اذن الوصول لموقعك' })}
                        </Text>
                    </TouchableOpacity>
                )}
                
                <View style={!gotLocation && styles.disabled}>
                    <FormField 
                        placeholder={t('services.search_placeholder', { defaultValue: 'ابحث عن اقرب خدمة ...' })}
                        type={'search'}
                        editable={gotLocation}
                    />    
                </View>
                
                <View style={[styles.recommendationContainer, !gotLocation && styles.disabled]}>
                    <Image source={Images.routing} />
                    <Text style={styles.recommendationText}>
                        {t('services.recommendation_text', { defaultValue: 'ترشيح لأقرب خدمات طبية بناءا علي موقعك الجغرافي' })}
                    </Text>
                </View>

                <TouchableOpacity style={[styles.serviceButton, !gotLocation && styles.disabled]} disabled={!gotLocation} onPress={() => handleNavigateToServiceList('doctors')}>
                    <Image source={Images.reports} style={styles.serviceIcon} />
                    <Text style={styles.serviceText}>
                        {t('services.nearest_doctors', { defaultValue: 'أقرب دكاترة' })}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.serviceButton, !gotLocation && styles.disabled]} disabled={!gotLocation} onPress={() => handleNavigateToServiceList('labs')}>
                    <Image source={Images.r2} style={styles.serviceIcon} />
                    <Text style={styles.serviceText}>
                        {t('services.nearest_labs', { defaultValue: 'أقرب معامل تحاليل' })}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.serviceButton, !gotLocation && styles.disabled]} disabled={!gotLocation} onPress={() => handleNavigateToServiceList('xray')}>
                    <Image source={Images.eshaa} style={styles.serviceIcon} />
                    <Text style={styles.serviceText}>
                        {t('services.nearest_xray', { defaultValue: 'أقرب معامل اشعة' })}
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
    container:{
        flex: 1,
        marginHorizontal: wp(4),
        gap: hp(1.5),
    },
    alarm:{
        backgroundColor:'#F8444F',
        paddingHorizontal: wp(3),
        height: hp(5),
        flexDirection:'row',
        gap: wp(3),
        opacity:0.5,
        alignItems:'center',
        borderRadius: 8,
    },
    alarmTxt:{
        fontWeight: '900',
        fontSize: hp(1.5),
    },
    recommendationContainer:{
        flexDirection:'row',
        alignItems:'center',
        gap: wp(3),
        opacity: 0.5,
    },
    recommendationText:{
        fontSize: hp(1.5),
        fontWeight: '700',
        color:'#014CC4',
    },
    serviceButton:{
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
    serviceIcon: {
        tintColor: '#000000',
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    serviceText: {
        fontSize: hp(1.8),
        fontWeight: '700',
        color: '#000000',
    },
    disabled: {
        opacity: 0.5,
    }
})
export default ServiceScreen