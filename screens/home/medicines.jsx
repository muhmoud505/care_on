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
  const { medicines, loading, error, fetchMedicines, addMedicine, loadMoreMedicines } = useMedicalRecords();

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

  // Determine if the toggle button should be visible
  const isToggleButtonVisible = areAllExpanded

  const finalAddButtonStyle = isToggleButtonVisible
    ? styles.addButtonHigh
    : styles.addButtonLow;
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
        keyExtractor={(item, index) => (item.id != null ? item.id.toString() : `medicine-${index}`)}
        onRefresh={onRefresh}
        refreshing={loading.medicines}
        onEndReached={loadMoreMedicines}
        contentContainerStyle={styles.listContent}
      />
      {isToggleButtonVisible && (
        <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={styles.toggleButton}>
          <Image source={areAllExpanded ? Images.shrink : Images.r6} />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={finalAddButtonStyle}
        onPress={() => navigation.navigate('addMedicine')}
      >
        <Image source={Images.add} />
      </TouchableOpacity>
     
      <StatusBar barStyle={'dark-content'}  backgroundColor="transparent"  />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    paddingTop: hp(1.2),
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(20), // Increased padding to clear the tab bar and floating buttons
    gap: hp(1.2),
  },
  addButtonHigh: { // Position when toggle button IS visible
    position: 'absolute',
    bottom: hp(24),
    right: wp(5),
    zIndex: 1,
  },
  addButtonLow: { // Position when toggle button IS NOT visible (takes its place)
    position: 'absolute',
    bottom: hp(16),
    right: wp(5),
    zIndex: 1,
  },
   toggleButton: {
    position: 'absolute',
    bottom: hp(16), // Raised to be clearly above the tab bar
    right: wp(8), // Aligned with the add button
    zIndex: 1,
  },
});

export default Medicines;