import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from 'react-i18next';
import LocationScreen from "../screens/services/Location";
import ServiceScreen from "../screens/services/NearestService";
import LocationFormScreen from "../screens/services/Screen";


const Stack=createNativeStackNavigator();
const ServiceStack=()=>{
    const { t } = useTranslation();
    return(
        <Stack.Navigator screenOptions={{
            headerShown:false
        }}>
            <Stack.Screen component={ServiceScreen} name="service" options={{ title: t('services.nearest_service', { defaultValue: 'أقرب خدمة طبية' }) }} />
            <Stack.Screen component={LocationScreen} name="location" options={{ title: t('services.nearest_service', { defaultValue: 'أقرب خدمة طبية' }) }} />
            <Stack.Screen component={LocationFormScreen} name="location2" options={{ title: t('services.nearest_service', { defaultValue: 'أقرب خدمة طبية' }) }} />
        </Stack.Navigator>
    )
}
export default ServiceStack