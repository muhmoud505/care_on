import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Reset from "../screens/auth/password/Reset";
import Profile from '../screens/auth/profile/ChildProfile';
const Stack= createNativeStackNavigator();
export default function ProfileStack(){
  return(
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen component={Profile} name='profile' />
      <Stack.Screen component={Reset} name="ResetPassword"/>
       {/* <Stack.Screen component={LinkedAcount} name='profile' options={{headerShown:false}}/>
       */}
    </Stack.Navigator>
  )
}