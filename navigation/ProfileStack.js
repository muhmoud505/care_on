import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Reset from "../screens/auth/password/Reset";
import LinkedAcount from "../screens/auth/profile/LinkedAcount";
import ProfileScreen from "../screens/auth/profile/ProfileScreen";
import AuthScreens from "./AuthStack";
const Stack= createNativeStackNavigator();

export default function ProfileStack(){
  return(
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen component={ProfileScreen} name='profile' />
      <Stack.Screen component={Reset} name="ResetPassword"/>
      <Stack.Screen component={AuthScreens} name="Auth"/>
       <Stack.Screen component={LinkedAcount} name='linked_account' options={{headerShown:false}}/>
      
    </Stack.Navigator>
  )
}