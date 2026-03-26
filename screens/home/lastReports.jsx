import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../components/CustomHeader';
import Eshaa from '../../components/eshaaComponent';
import { Icons } from '../../components/Icons';
import ListContainer from '../../components/ListContainer';
import Medicine from '../../components/medicineComponent';
import Report from '../../components/reportCoponent';
import Result from '../../components/resultComponents';
import { useAuth } from '../../contexts/authContext';
import { useMedicalRecords } from '../../contexts/medicalRecordsContext';
import { hp, wp } from '../../utils/responsive';

const LastReports = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const navigation = useNavigation();
  const { user } = useAuth();
  const {
    medicines,
    results,
    eshaa,
    reports,
    loading,
    error,
    fetchMedicines,
    fetchResults,
    fetchEshaas,
    fetchReports,
  } = useMedicalRecords();

  // Combine the latest record from each category into a single array.
  // useMemo ensures this array is only recalculated when the source data changes.
  const lastRecords = useMemo(() => {
    const combined = [
      medicines[0] && { ...medicines[0], type: 'medicine' },
      results[0] && { ...results[0], type: 'result' },
      eshaa[0] && { ...eshaa[0], type: 'eshaa' },
      reports[0] && { ...reports[0], type: 'report' },
    ].filter(Boolean); // Removes any undefined entries if a category has no records

    // Sort the final list by date to show the most recent record first.
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [medicines, results, eshaa, reports]);

  // This effect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Fetch the latest record (per_page: 1) for each category.
      fetchMedicines({ per_page: 1 });
      fetchResults({ per_page: 1 });
      fetchEshaas({ per_page: 1 });
      fetchReports({ per_page: 1 });
    }, [user?.token?.value, fetchMedicines, fetchResults, fetchEshaas, fetchReports])
  );
   useEffect(() => {
      // We only show the toast if loading has finished AND it's not the very first app boot
      if (loading.results === false && results.length === 0 && !error.results && !loading.results
        && 
        loading.medicines === false && medicines.length === 0 && !error.medicines && !loading.medicines &&
        loading.eshaa === false && eshaa.length === 0 && !error.eshaa && !loading.eshaa &&
        loading.reports === false && reports.length === 0 && !error.reports && !loading.reports
      ) {
        console.log("Triggering Toast..."); // If you see this in LOG, the logic is working
        
        Toast.show({
          type: 'info',
          text1: t('common.info'),
          text2: t('home.no_reports_found'),
          position: 'top', // Changed to top to ensure it's not under the tab bar
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 60, // Gives it some space from the header
        });
      }
    }, [loading.results, results.length, error.results, loading.medicines, medicines.length, error.medicines, loading.eshaa, eshaa.length, error.eshaa, loading.reports, reports.length, error.reports, t]);
  

  const onRefresh = useCallback(() => {
    // When refreshing, force a refetch of the latest record for each category.
    fetchMedicines({ force: true, per_page: 1 });
    fetchResults({ force: true, per_page: 1 });
    fetchEshaas({ force: true, per_page: 1 });
    fetchReports({ force: true, per_page: 1 });
  }, [fetchMedicines, fetchResults, fetchEshaas, fetchReports]);

  const handleItemExpand = (id, isExpanded) => {
    setExpandedItems(prev => ({ ...prev, [id]: isExpanded }));
  };

  // Check if there are any records AND if every one of them is marked as expanded.
  // The `lastRecords.length > 0` check is crucial because `[].every(...)` returns true by default.
  const areAllExpanded =
    lastRecords.length > 0 && lastRecords.every(item => !!expandedItems[`${item.type}-${item.id}`]);

  const toggleAll = () => {
    const nextExpandedState = !areAllExpanded;
    const newExpandedState = lastRecords.reduce((acc, item) => {
      acc[`${item.type}-${item.id}`] = nextExpandedState;
      return acc;
    }, {});
    setExpandedItems(newExpandedState);
  };

  const renderItem = ({ item }) => {
    console.log("item of rednder" + JSON.stringify(item));
    
    // Extract file URL from the documents array (taking the first one) or fallback to other keys
    const fileUrl = item.documents?.[0]?.url || item.documents?.[0]?.file || item.fileUrl || item.file || item.url;
    const uniqueId = `${item.type}-${item.id}`;
    const itemProps = {
      ...item,
      fileUrl: fileUrl,
      expanded: expandedItems[uniqueId] || false,
      onExpandedChange: (isExpanded) => handleItemExpand(uniqueId, isExpanded),
    };

    switch(item.type) {
      case 'result':
        return <Result {...itemProps} />;
      case 'medicine':
        return <Medicine {...itemProps} />;
      case 'eshaa':
        return <Eshaa {...itemProps} />;
      case 'report':
        return <Report {...itemProps} showType={true} TYPE={item.subType} />;
      default:
        return null;
    }
  };

  // Determine if the toggle button should be visible
  const isToggleButtonVisible = areAllExpanded


  // Define the specific style for the add button based on toggle button visibility
  const finalAddButtonStyle = isToggleButtonVisible
    ? styles.addButtonHigh // When toggle is visible, add button is higher
    : styles.addButtonLow;  // When toggle is NOT visible, add button is lower (takes toggle's place)
  return (
    <SafeAreaView style={[styles.container,]}>
      <CustomHeader text={t('home.last_reports_title')}/>
      <ListContainer
        // Combine loading and error states from all categories
        // Only show the full-screen loader if there are no records yet.
        // Otherwise, the pull-to-refresh indicator will be used.
        loading={lastRecords.length === 0 && (loading.medicines || loading.results || loading.eshaa || loading.reports)}
        error={error.medicines || error.results || error.eshaa || error.reports}
        data={lastRecords}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item.id}`} // This is already robust
        onRefresh={onRefresh}
        refreshing={loading.medicines || loading.results || loading.eshaa || loading.reports}
        // onEndReached is not needed here since we are not paginating
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        emptyListMessage={t('home.no_reports_found')}
      />
     {isToggleButtonVisible && (
             <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={[styles.toggleButton, { [isRTL ? 'left' : 'right']: wp(8) }]}>
               <Icons.CloseAll width={wp(13)} height={wp(13)} />
             </TouchableOpacity>
           )}
           <TouchableOpacity
             style={[finalAddButtonStyle, { [isRTL ? 'left' : 'right']: wp(5) }]}
             onPress={() => navigation.navigate('AddRecordSelector')}
           >
             <Icons.Add width={wp(18)} height={wp(18)} />
           </TouchableOpacity>
           <Toast />
    </SafeAreaView>
  );
};

export default LastReports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF', // A light background color for consistency
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: hp(20), // Add significant padding to clear the tab bar and floating buttons
  },
  separator: {
    height: 12,
  },
  addButtonHigh: { // Position when toggle button IS visible
    position: 'absolute',
    bottom: hp(24),
    // horizontal position overridden inline (isRTL ? left : right)
    zIndex: 1,
  },
  addButtonLow: { // Position when toggle button IS NOT visible (takes its place)
    position: 'absolute',
    bottom: hp(16),
    // horizontal position overridden inline (isRTL ? left : right)
    zIndex: 1,
  },
  toggleButton: {
    position: 'absolute',
    bottom: hp(16),
    // horizontal position overridden inline (isRTL ? left : right)
    zIndex: 1,
  },
});