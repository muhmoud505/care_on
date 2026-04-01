import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/CustomHeader';
import Eshaa from '../../components/eshaaComponent';
import { Icons } from '../../components/Icons';
import ListContainer from '../../components/ListContainer';
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

const Eshaas = () => { 
   const [expandedItems, setExpandedItems] = useState({});
   const { t, i18n } = useTranslation();
   const navigation = useNavigation();
   const { user } = useAuth();
   const { eshaa, loading, error, fetchEshaas } = useMedicalRecords();
   const isRTL = i18n.dir() === 'rtl';

   // This effect runs every time the screen comes into focus
   useFocusEffect(
    useCallback(() => {
      if (user?.token?.value) {
        fetchEshaas();
      }
    }, [user?.token?.value, fetchEshaas])
  );

   useEffect(() => {
    // Enhanced empty state handling with toast service
    if (loading.eshaa === false && eshaa.length === 0 && !error.eshaa) {
      showInfo(
        t('common.info'),
        t('eshaa_list.eshaa_empty_state'),
        { duration: 3000 }
      );
    }
  }, [loading.eshaa, eshaa.length, error.eshaa, t]);

  const onRefresh = useCallback(async () => {
    try {
      await fetchEshaas({ force: true });
      showSuccess(
        t('common.success'),
        t('eshaa_list.eshaa_loading_success'),
        { duration: 2000 }
      );
    } catch (error) {
      // Enhanced error handling for refresh
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('eshaa_list.eshaa_network_error'),
          () => onRefresh() // Retry function
        );
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        showPermissionError(
          t('eshaa_list.eshaa_permission_error'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('server') || error.message?.includes('500')) {
        showServerError(
          t('eshaa_list.eshaa_server_error'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('eshaa_list.eshaa_refresh_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  }, [fetchEshaas, t]);

  const handleAddEshaa = () => {
    try {
      navigation.navigate('addEshaa');
    } catch (error) {
      showError(
        t('home.navigation_error'),
        error.message || t('common.something_went_wrong'),
        { duration: 4000 }
      );
    }
  };

  const handleItemExpand = (id, isExpanded) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: isExpanded
    }));
  };

  const areAllExpanded = eshaa.length > 0 && eshaa.every(item => expandedItems[item.id]);

  const toggleAll = () => {
    const nextExpandedState = !areAllExpanded;
    const newExpandedState = eshaa.reduce((acc, item) => {
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
  const renderItem = ({ item }) => {
    // Extract file URL from the documents array (taking the first one) or fallback to other keys
    const fileUrl = item.documents?.[0]?.url || item.documents?.[0]?.file || item.fileUrl || item.file || item.url;
    console.log(`[Eshaa] Item ${item.id} documents:`, JSON.stringify(item.documents));
    return (
    <Eshaa
      title={item.title}
      description={item.description}
      date={item.date}
      labName={item.labName}
      icon={item.icon}
      fileUrl={fileUrl}
      expanded={expandedItems[item.id] || false}
      onExpandedChange={(isExpanded) => handleItemExpand(item.id, isExpanded)}
    />
  );
  };
  return (
    <SafeAreaView style={[styles.container,]}>
      <CustomHeader text={t('home.xray_title')}/>
      <ListContainer
        loading={loading.eshaa}
        error={error.eshaa}
        data={eshaa}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={onRefresh}
        refreshing={loading.eshaa}
        contentContainerStyle={styles.listContent}
        emptyListMessage={t('home.no_xrays_found')}
      />
   {isToggleButtonVisible && (
           <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={[styles.toggleButton, { [isRTL ? 'left' : 'right']: wp(8) }]}>
             <Icons.CloseAll width={wp(13)} height={wp(13)} />
           </TouchableOpacity>
         )}
         <TouchableOpacity
           style={[finalAddButtonStyle, { [isRTL ? 'left' : 'right']: wp(5) }]}
           onPress={handleAddEshaa}
         >
           <Icons.Add width={wp(18)} height={wp(18)} />
         </TouchableOpacity>
         <Toast />
    </SafeAreaView>
  );
};

export default Eshaas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  listContent: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4), // Keep horizontal padding
    paddingBottom: hp(20), // Add padding to clear the tab bar and floating button
    gap: hp(1.2),
  },
  addButtonHigh: { // Position when toggle button IS visible
    position:'absolute',
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
  addButton: {
    position: 'absolute',
    bottom: hp(3),
    right: wp(5),
  },
});