import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useTranslation } from 'react-i18next'
import Code from "../screens/auth/password/Code"
import Forget from "../screens/auth/password/Forget"
import Reset from "../screens/auth/password/Reset"
import AfterCode from "../screens/auth/password/ResetAfterCode"
import SignIn from "../screens/auth/signin"
import S1 from "../screens/auth/signup/a"
import Signup from "../screens/auth/signup/signup"; // Updated import

const Stack =createNativeStackNavigator()
  const AuthStack=()=>{
    const { t } = useTranslation();
  return(
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="s1" component={S1} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ title: t('auth.create_account', { defaultValue: 'إنشاء حساب' }) }} />
        <Stack.Screen name="signin" component={SignIn} options={{ title: t('auth.signin', { defaultValue: 'تسجيل الدخول' }) }} />
              <Stack.Screen name='reset' component={Reset} options={{ title: t('auth.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' }) }} />
              <Stack.Screen name='forget' component={Forget} options={{ title: t('auth.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' }) }} />
              <Stack.Screen name='code' component={Code} options={{ title: t('auth.enter_code', { defaultValue: 'يرجي ادخال الكود' }) }} />
              <Stack.Screen name='aftercode' component={AfterCode} options={{ headerShown:false }} />
        
    </Stack.Navigator>
  )
}
export default AuthStack;