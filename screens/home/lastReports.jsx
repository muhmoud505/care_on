import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import Eshaa from '../../components/eshaaComponent';
import ListContainer from '../../components/ListContainer';
import Medicine from '../../components/medicineComponent';
import Report from '../../components/reportCoponent';
import Result from '../../components/resultComponents';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';
import { useMedicalRecords } from '../../contexts/medicalRecordsContext';
import { hp, wp } from '../../utils/responsive';

const LastReports = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const { t, i18n } = useTranslation();
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
      medicines[0], // Get the first (and only) item from the medicines array
      results[0],
      eshaa[0],
      reports[0],
    ].filter(Boolean); // .filter(Boolean) removes any undefined entries if a category has no records

    // Sort the final list by date to show the most recent record first.
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [medicines, results, eshaa, reports]);

  // This effect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.token?.value) {
        // Fetch the single latest record for each category.
        fetchMedicines({ per_page: 1 });
        fetchResults({ per_page: 1 });
        fetchEshaas({ per_page: 1 });
        fetchReports({ per_page: 1 });
      }
    }, [user?.token?.value, fetchMedicines, fetchResults, fetchEshaas, fetchReports])
  );

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

  const areAllExpanded = lastRecords.length > 0 && lastRecords.every(item => expandedItems[`${item.type}-${item.id}`]);

  const toggleAll = () => {
    const nextExpandedState = !areAllExpanded;
    const newExpandedState = lastRecords.reduce((acc, item) => {
      acc[`${item.type}-${item.id}`] = nextExpandedState;
      return acc;
    }, {});
    setExpandedItems(newExpandedState);
  };

  const renderItem = ({ item }) => {
    const uniqueId = `${item.type}-${item.id}`;
    const itemProps = {
      ...item,
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
        return <Report {...itemProps} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      <CustomHeader text={t('home.last_reports_title')}/>
      <ListContainer
        // Combine loading and error states from all categories
        loading={loading.medicines || loading.results || loading.eshaa || loading.reports}
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
      {lastRecords.length > 0 && !(loading.medicines || loading.results || loading.eshaa || loading.reports) && (
        <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={styles.expandButton}>
          <Image source={areAllExpanded ? Images.shrink : Images.r6} />
        </TouchableOpacity>
      )}
      {/* Add record button */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddRecordSelector')}>
        <Image source={Images.add} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default LastReports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // A light background color for consistency
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: hp(20), // Add significant padding to clear the tab bar and floating buttons
  },
  separator: {
    height: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: hp(13), // Increased to position it above the bottom tab bar
    right: wp(5),
    zIndex: 1, // Ensure the button is rendered on top of other elements
  },
  expandButton: {
    position: 'absolute',
    bottom: hp(10),
    left: wp(5),
    zIndex: 1,
  },
});