import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddEshaaScreen from '../screens/home/addMedicalRecordsScreen/addEshaaScreen';
import addMedicineScreen from '../screens/home/addMedicalRecordsScreen/addMedicineScreen';
import AddRecordSelector from '../screens/home/addMedicalRecordsScreen/AddRecordSelector';
import AddReportScreen from '../screens/home/addMedicalRecordsScreen/addReportScreen';
import AddResultScreen from '../screens/home/addMedicalRecordsScreen/addResultScreen';
import DrawerNavigator from './DrawerNavigator';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppDrawer" component={DrawerNavigator} />
      {/* Screens that should appear over the tabs/drawer */}
      <Stack.Screen name="addResult" component={AddResultScreen} />
      <Stack.Screen name="addEshaa" component={AddEshaaScreen} />
      <Stack.Screen name="addReport" component={AddReportScreen} />
      <Stack.Screen name="AddRecordSelector" component={AddRecordSelector} />
      <Stack.Screen name="addMedicine" component={addMedicineScreen} />
      
    </Stack.Navigator>
  );
};

export default AppStack;