import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/CustomHeader';
import { Icons } from '../../components/Icons';
import ListContainer from '../../components/ListContainer';
import Medicine from '../../components/medicineComponent';
import { useAuth } from '../../contexts/authContext';
import { useMedicalRecords } from '../../contexts/medicalRecordsContext';
import { hp, wp } from '../../utils/responsive';
import {
    showError,
    showInfo,
    showNetworkError,
    showPermissionError,
    showServerError,
    showSuccess,
} from '../../utils/toastService';

const Medicines = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const navigation=useNavigation()
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { medicines, loading, error, fetchMedicines, addMedicine, loadMoreMedicines } = useMedicalRecords();
  const isRTL = i18n.dir() === 'rtl';

  // This effect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.token?.value) {
        fetchMedicines();
      }
    }, [user?.token?.value, fetchMedicines])
  );

  useEffect(() => {
    // Enhanced empty state handling with toast service
    if (loading.medicines === false && medicines.length === 0 && !error.medicines) {
      showInfo(
        t('common.info'),
        t('medicines_list.medicines_empty_state'),
        { duration: 3000 }
      );
    }
  }, [loading.medicines, medicines.length, error.medicines, t]);

  useEffect(() => {
    if (route.params?.newMedicine) {
      // Enhanced medicine addition with error handling
      try {
        addMedicine(route.params.newMedicine);
        showSuccess(
          t('common.success'),
          t('add_medicine.medicine_created_success'),
          { duration: 3000 }
        );
      } catch (error) {
        showError(
          t('medicines_list.add_medicine_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
      // Clear the parameter so it's not added again on re-render
      navigation.setParams({ newMedicine: null });
    }
  }, [route.params?.newMedicine, addMedicine, navigation, t]);

  // Memoize the onRefresh function to prevent unnecessary re-renders of ListContainer
  const onRefresh = useCallback(async () => {
    try {
      await fetchMedicines();
      showSuccess(
        t('common.success'),
        t('medicines_list.medicines_loading_success'),
        { duration: 2000 }
      );
    } catch (error) {
      // Enhanced error handling for refresh
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('medicines_list.medicines_network_error'),
          () => onRefresh() // Retry function
        );
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        showPermissionError(
          t('medicines_list.medicines_permission_error'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('server') || error.message?.includes('500')) {
        showServerError(
          t('medicines_list.medicines_server_error'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('medicines_list.medicines_refresh_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  }, [fetchMedicines, t]);

  const handleAddMedicine = () => {
    try {
      navigation.navigate('addMedicine');
    } catch (error) {
      showError(
        t('home.navigation_error'),
        error.message || t('common.something_went_wrong'),
        { duration: 4000 }
      );
    }
  };

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
    console.log("the medicines are:", JSON.stringify(medicines[0] || {}));
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
              <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={[styles.toggleButton, { [isRTL ? 'left' : 'right']: wp(8) }]}>
                <Icons.CloseAll width={wp(13)} height={wp(13)} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[finalAddButtonStyle, { [isRTL ? 'left' : 'right']: wp(5) }]}
              onPress={handleAddMedicine}
            >
              <Icons.Add width={wp(18)} height={wp(18)} />
            </TouchableOpacity>
     
      <StatusBar barStyle={'dark-content'}  backgroundColor="transparent"  />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
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