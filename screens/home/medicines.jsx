import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
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
  const [expandedItems, setExpandedItems] = useState({});
  const navigation=useNavigation()
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  console.log(user?.token?.value);
  
  const { medicines, loading, error, fetchMedicines, addMedicine, loadMoreMedicines } = useMedicalRecords();
  console.log(medicines);

  // This effect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.token?.value) {
        fetchMedicines();
      }
    }, [user?.token?.value, fetchMedicines])
  );

  useEffect(() => {
    if (route.params?.newMedicine) {
      // Call the new context function to handle the optimistic update and API call
      addMedicine(route.params.newMedicine);
      // Clear the parameter so it's not added again on re-render
      navigation.setParams({ newMedicine: null });
    }
  }, [route.params?.newMedicine, addMedicine, navigation]);

  // Memoize the onRefresh function to prevent unnecessary re-renders of ListContainer
  const onRefresh = useCallback(() => {
    // You can pass { force: true } if your context supports it for pull-to-refresh
    fetchMedicines();
  }, [fetchMedicines]);

  const handleItemExpand = (id, isExpanded) => {
    setExpandedItems(prev => ({ ...prev, [id]: isExpanded }));
  };

  const areAllExpanded = medicines.length > 0 && medicines.every(item => expandedItems[item.id]);

  const toggleAll = () => {
    const nextExpandedState = !areAllExpanded;
    const newExpandedState = medicines.reduce((acc, item) => {
      acc[item.id] = nextExpandedState;
      return acc;
    }, {});
    setExpandedItems(newExpandedState);
  };

  const renderItem = ({ item }) => (
    <Medicine
      title={item.title} // Assuming item.title is already the translated/displayable title
      description={item.description}
      from={item.from}
      to={item.to}
      id={item.id}
      icon={item.icon}
      expanded={expandedItems[item.id] || false}
      onExpandedChange={(isExpanded) => handleItemExpand(item.id, isExpanded)}
      style={item.pending ? { opacity: 0.6 } : {}} // Visually indicate pending items
    />
  );

  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      
      <CustomHeader text={t('home.medicines_title')}/>

      <ListContainer
        loading={loading.medicines}
        error={error.medicines}
        data={medicines}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        onRefresh={onRefresh}
        refreshing={loading.medicines}
        onEndReached={loadMoreMedicines}
        contentContainerStyle={styles.listContent}
      />
      {medicines.length > 0 && !loading.medicines && (
        <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={styles.expandButton}>
          <Image source={areAllExpanded ? Images.shrink : Images.r6} />
        </TouchableOpacity>
      )}
      
      
     
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
    paddingHorizontal: wp(4),
    paddingBottom: hp(15), // Increased padding to clear the tab bar and the add button
    gap: hp(1.2),
  },
  addButton: {
    position: 'absolute',
    bottom: hp(10),
    right: wp(5),
  },
  expandButton: {
    position: 'absolute',
    bottom: hp(10),
    left: wp(10),
    paddingBottom:hp(3)
  },
});

export default Medicines;