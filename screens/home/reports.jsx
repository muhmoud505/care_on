import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/CustomHeader';
import { Icons } from '../../components/Icons';
import ListContainer from '../../components/ListContainer';
import Report from '../../components/reportCoponent';
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

const Reports = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { reports, loading, error, fetchReports, loadMoreReports } = useMedicalRecords();
  const isRTL = i18n.dir() === 'rtl';

  // This effect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.token?.value) {
        fetchReports();
       
      }
    }, [user?.token?.value, fetchReports])
  );
 useEffect(() => {
    // Enhanced empty state handling with toast service
    if (loading.reports === false && reports.length === 0 && !error.reports) {
      showInfo(
        t('common.info'),
        t('reports_list.reports_empty_state'),
        { duration: 3000 }
      );
    }
  }, [loading.reports, reports.length, error.reports, t]);

  const onRefresh = useCallback(async () => {
    try {
      await fetchReports({ force: true });
      showSuccess(
        t('common.success'),
        t('reports_list.reports_loading_success'),
        { duration: 2000 }
      );
    } catch (error) {
      // Enhanced error handling for refresh
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('reports_list.reports_network_error'),
          () => onRefresh() // Retry function
        );
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        showPermissionError(
          t('reports_list.reports_permission_error'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('server') || error.message?.includes('500')) {
        showServerError(
          t('reports_list.reports_server_error'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('reports_list.reports_refresh_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  }, [fetchReports, t]);

  const handleAddReport = () => {
    try {
      navigation.navigate('addReport');
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

  const areAllExpanded = reports.length > 0 && reports.every(item => expandedItems[item.id]);

  const toggleAll = () => {
    const nextExpandedState = !areAllExpanded;
    const newExpandedState = reports.reduce((acc, item) => {
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
    return (
    <Report
      {...item}
      fileUrl={fileUrl}
      expanded={expandedItems[item.id] || false}
      onExpandedChange={(isExpanded) => handleItemExpand(item.id, isExpanded)}
      TYPE={item.subType}
    />
  );
  };
  return (
    <SafeAreaView style={[styles.container, ]}>
      <CustomHeader text={t('home.reports_title')} />
      <ListContainer
        loading={loading.reports}
        error={error.reports}
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={onRefresh}
        refreshing={loading.reports}
        onEndReached={loadMoreReports}
        contentContainerStyle={styles.listContent}
        emptyListMessage={t('home.no_doctor_reports_found')}
      />
     {isToggleButtonVisible && (
             <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={[styles.toggleButton, { [isRTL ? 'left' : 'right']: wp(8) }]}>
               <Icons.CloseAll width={wp(13)} height={wp(13)} />
             </TouchableOpacity>
           )}
           <TouchableOpacity
             style={[finalAddButtonStyle, { [isRTL ? 'left' : 'right']: wp(5) }]}
             onPress={handleAddReport}
           >
             <Icons.Add width={wp(18)} height={wp(18)} />
           </TouchableOpacity>
           <Toast />
    </SafeAreaView>
  );
};

export default Reports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  listContent: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4), // Keep horizontal padding
    paddingBottom: hp(20), // Add padding to clear the tab bar and floating buttons
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
  addButton: {
    position: 'absolute',
    bottom: hp(10),
    right: wp(5),
  },
});