import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorsUsedCodesScreen from '../screens/doctorsUsedCodes/DoctorsUsedCodesScreen';
import Account from '../screens/home/account';
import AddEshaaScreen from '../screens/home/addMedicalRecordsScreen/addEshaaScreen';
import AddMedicineScreen from '../screens/home/addMedicalRecordsScreen/addMedicineScreen';
import AddRecordSelector from '../screens/home/addMedicalRecordsScreen/AddRecordSelector';
import AddReportScreen from '../screens/home/addMedicalRecordsScreen/addReportScreen';
import AddResultScreen from '../screens/home/addMedicalRecordsScreen/addResultScreen';
import YourCreatedCodesScreen from '../screens/yourCreatedCodes/YourCreatedCodesScreen';
import DrawerNavigator from './DrawerNavigator';
import PaymentStack from './PaymentStack';
import ProfileStack from './ProfileStack';
import ServiceStack from './ServiceStack';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen name="ProfileStack" component={ProfileStack} />
      <Stack.Screen name="PaymentStack" component={PaymentStack} />
      <Stack.Screen name="ServiceStack" component={ServiceStack} />
      <Stack.Screen name="accounts" component={Account} />
      {/* Code screens */}
      <Stack.Screen name="DoctorsUsedCodes" component={DoctorsUsedCodesScreen} />
      <Stack.Screen name="YourCreatedCodes" component={YourCreatedCodesScreen} />
      {/* Screens that should appear over the tabs/drawer */}
      <Stack.Screen name="addResult" component={AddResultScreen} />
      <Stack.Screen name="addEshaa" component={AddEshaaScreen} />
      <Stack.Screen name="addReport" component={AddReportScreen} />
      <Stack.Screen name="AddRecordSelector" component={AddRecordSelector} />
      <Stack.Screen name="addMedicine" component={AddMedicineScreen} />
      
    </Stack.Navigator>
  );
};

export default AppStack;