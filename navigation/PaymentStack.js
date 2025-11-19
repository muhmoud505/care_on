import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from 'react-i18next';
import PaymaintScreen from "../screens/payment/PaymaintScreen";
import PaymentStatus from "../screens/payment/PaymentScreen2";


const Stack=createNativeStackNavigator();
const PaymentStack=()=>{
    const { t } = useTranslation();
    return(
        <Stack.Navigator screenOptions={{
            headerShown:false
        }}>
            <Stack.Screen component={PaymaintScreen} name="payment" options={{ title: t('payment.records', { defaultValue: 'سجلات الدفع' }) }} />
            <Stack.Screen component={PaymentStatus} name="payment_status" options={{ title: t('payment.details', { defaultValue: 'تفاصيل المعاملة' }) }} />
        </Stack.Navigator>
    )
}
export default PaymentStack