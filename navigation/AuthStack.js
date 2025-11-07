import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from 'react-i18next';

// Import Screens and Navigators
import Forget from "../screens/auth/password/Forget";
import AfterCode from "../screens/auth/password/ResetAfterCode";
import SignIn from "../screens/auth/signin";
import S1 from "../screens/auth/signup/a";
import S2 from "../screens/auth/signup/b";
import PasswordScreen from "../screens/auth/signup/passwork";
import Signup from "../screens/auth/signup/signup";
import Signup2 from "../screens/auth/signup/signupBaby";

const Stack = createNativeStackNavigator();

export const AuthScreens = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="s1" component={S1} />
      <Stack.Screen name="s2" component={S2} />
      <Stack.Screen name="signupBaby" component={Signup2} />
      <Stack.Screen name="Signup" component={Signup} options={{ title: t('auth.create_account', { defaultValue: 'إنشاء حساب' }) }} />
      <Stack.Screen name="password" options={{ title: t('set_password', { defaultValue: 'كلمة السر' }) }}>
        {(props) => <PasswordScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="signin" component={SignIn} options={{ title: t('auth.signin', { defaultValue: 'تسجيل الدخول' }) }} />
      <Stack.Screen name='forget' component={Forget} options={{ title: t('auth.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' }) }} />
      <Stack.Screen name='aftercode' component={AfterCode} />
    </Stack.Navigator>
  );
};

export default AuthScreens;