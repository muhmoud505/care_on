import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from 'react-i18next';
import ContactUs from "../screens/services/ContactUs";
import LocationScreen from "../screens/services/Location";
import ServiceScreen from "../screens/services/NearestService";
import PrivacyPolicy from "../screens/services/PrivacyPolicy";
import LocationFormScreen from "../screens/services/Screen";
import TermsOfService from "../screens/services/TermsOfService";

const Stack=createNativeStackNavigator();
const ServiceStack=()=>{
    const { t } = useTranslation();
    return(
        <Stack.Navigator screenOptions={{
            headerShown:false
        }}>
            <Stack.Screen component={ContactUs} name="ContactUs" options={{ title: t('drawer.contact_us'), headerShown: false }} />
            <Stack.Screen component={ServiceScreen} name="service" options={{ title: t('services.nearest_service', { defaultValue: 'أقرب خدمة طبية' }) }} />
            <Stack.Screen component={LocationScreen} name="location" options={{ title: t('services.nearest_service', { defaultValue: 'أقرب خدمة طبية' }) }} />
            <Stack.Screen component={LocationFormScreen} name="location2" options={{ title: t('services.nearest_service', { defaultValue: 'أقرب خدمة طبية' }) }} />
            <Stack.Screen component={PrivacyPolicy} name="PrivacyPolicy" options={{ title: t('privacy_policy.title'), headerShown: false }} />
            <Stack.Screen component={TermsOfService} name="TermsOfService" options={{ title: t('terms_of_service.title'), headerShown: false }} />
        </Stack.Navigator>
    )
}
export default ServiceStack