import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import ListContainer from '../../components/ListContainer';
import Medicine from '../../components/medicineComponent';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';
import { useMedicalRecords } from '../../contexts/medicalRecordsContext';
import { hp, wp } from '../../utils/responsive';

const Medicines = () => {
  const navigation=useNavigation()
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { medicines, loading, error, fetchMedicines, addMedicine } = useMedicalRecords();
  console.log(medicines);

  useEffect(() => {
    
    if (user?.token) {
     
    
      
      
      fetchMedicines();


    }
  }, [user, fetchMedicines]);

  useEffect(() => {
    if (route.params?.newMedicine) {
      // Call the new context function to handle the optimistic update and API call
      addMedicine(route.params.newMedicine);
      // Clear the parameter so it's not added again on re-render
      navigation.setParams({ newMedicine: null });
    }
  }, [route.params?.newMedicine]);

  const renderItem = ({ item }) => (
    <Medicine
      title={item.title} // Assuming item.title is already the translated/displayable title
      dose={item.dose} // Assuming item.dose is the direct string or already translated
      from={item.from}
      to={item.to}
      icon={item.icon}
      style={item.pending ? { opacity: 0.6 } : {}} // Visually indicate pending items
    />
  );

  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      
      <CustomHeader text={t('home.medicines_title', { defaultValue: 'الادوية' })}/>

      <ListContainer
        loading={loading.medicines}
        error={error.medicines}
        data={medicines}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={() => fetchMedicines({ force: true })}
        refreshing={loading.medicines}
        contentContainerStyle={styles.listContent}
      />
      
      {/* Add medication button */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('add')}>
        <Image source={Images.add} />
      </TouchableOpacity>
      
     
      <StatusBar barStyle={'dark-content'}  backgroundColor="transparent"  />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: hp(1.2),
  },
  listContent: {
    paddingBottom: hp(10), // Ensure space for the add button
  },
  addButton: {
    position: 'absolute',
    bottom: hp(3),
    left: wp(5),

  },
});

export default Medicines;