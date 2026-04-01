import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react'; // Added useEffect
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message'; // Import Toast
import CustomHeader from '../../components/CustomHeader';
import { Icons } from '../../components/Icons';
import ListContainer from '../../components/ListContainer';
import Result from '../../components/resultComponents';
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

const Results = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { results, loading, error, fetchResults } = useMedicalRecords();
  const isRTL = i18n.dir() === 'rtl'; // Inline RTL logic
console.log(results[0])
  // This effect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.token?.value) {
        fetchResults();
      }
    }, [user?.token?.value, fetchResults])
  );

  // Enhanced empty state handling with toast service
  useEffect(() => {
    if (loading.results === false && results.length === 0 && !error.results) {
      showInfo(
        t('common.info'),
        t('results_list.results_empty_state'),
        { duration: 3000 }
      );
    }
  }, [loading.results, results.length, error.results, t]);

  const onRefresh = useCallback(async () => {
    try {
      await fetchResults({ force: true });
      showSuccess(
        t('common.success'),
        t('results_list.results_loading_success'),
        { duration: 2000 }
      );
    } catch (error) {
      // Enhanced error handling for refresh
      if (error.message?.includes('Network request failed') || error.message?.includes('network')) {
        showNetworkError(
          t('results_list.results_network_error'),
          () => onRefresh() // Retry function
        );
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        showPermissionError(
          t('results_list.results_permission_error'),
          { duration: 4000 }
        );
      } else if (error.message?.includes('server') || error.message?.includes('500')) {
        showServerError(
          t('results_list.results_server_error'),
          { duration: 4000 }
        );
      } else {
        showError(
          t('results_list.results_refresh_failed'),
          error.message || t('common.something_went_wrong'),
          { duration: 4000 }
        );
      }
    }
  }, [fetchResults, t]);

  const handleItemExpand = (id, isExpanded) => {
    setExpandedItems((prev) => ({ ...prev, [id]: isExpanded }));
  };

  const areAllExpanded = results.length > 0 && results.every((item) => expandedItems[item.id]);

  const toggleAll = () => {
    const nextExpandedState = !areAllExpanded;
    const newExpandedState = results.reduce((acc, item) => {
      acc[item.id] = nextExpandedState;
      return acc;
    }, {});
    setExpandedItems(newExpandedState);
  };

  const isToggleButtonVisible = areAllExpanded;

  const finalAddButtonStyle = isToggleButtonVisible
    ? styles.addButtonHigh
    : styles.addButtonLow;

  const renderItem = ({ item }) => {
    const fileUrl = item.documents?.[0]?.url || item.documents?.[0]?.file || item.fileUrl || item.file || item.url;

    return (
      <Result
        {...item}
        fileUrl={fileUrl}
        expanded={expandedItems[item.id] || false}
        onExpandedChange={(isExpanded) => handleItemExpand(item.id, isExpanded)}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, ]}>
      <CustomHeader text={t('home.results_title')} />
      <View style={{ direction: isRTL ? 'ltr' : 'ltr' }}>

      
      <ListContainer
        loading={loading.results}
        error={error.results}
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={onRefresh}
        refreshing={loading.results}
        contentContainerStyle={styles.listContent}
        emptyListMessage={t('home.no_results_found')}
      />
      
      {isToggleButtonVisible && (
        <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={[styles.toggleButton, { [isRTL ? 'left' : 'right']: wp(8) }]}>
          <Icons.CloseAll width={wp(13)} height={wp(13)} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.addButton, { [isRTL ? 'right' : 'left']: wp(5) }]}
        onPress={() => navigation.navigate('addResult')}
      >
        <Icons.Add width={wp(18)} height={wp(18)} />
      </TouchableOpacity>

      {/* Render the Toast component here */}
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default Results;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  listContent: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    paddingBottom: hp(20),
    gap: hp(1.2),
  },
  addButtonHigh: {
    position: 'absolute',
    bottom: hp(1),
    right: wp(5),
    zIndex: 1,
  },
  addButtonLow: {
    position: 'absolute',
    bottom: hp(1),
    right: wp(5),
    zIndex: 1,
  },
  toggleButton: {
    position: 'absolute',
    bottom: hp(1),
    right: wp(8),
    zIndex: 1,
  },
  addButton: {
    position: 'absolute',
     bottom: hp(24),
    right: wp(5),
  },
});