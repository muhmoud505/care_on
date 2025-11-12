import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import ListContainer from '../../components/ListContainer';
import Report from '../../components/reportCoponent';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';
import { useMedicalRecords } from '../../contexts/medicalRecordsContext';
import { hp, wp } from '../../utils/responsive';

const Reports = () => {
  const [expandedItems, setExpandedItems] = useState({});
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { reports, loading, error, fetchReports } = useMedicalRecords();

  // This effect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.data?.token?.value) {
        fetchReports();
      }
    }, [user?.data?.token?.value, fetchReports])
  );

  const onRefresh = useCallback(() => {
    fetchReports({ force: true });
  }, [fetchReports]);

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

  const renderItem = ({ item }) => (
    <Report
      {...item}
      expanded={expandedItems[item.id] || false}
      onExpandedChange={(isExpanded) => handleItemExpand(item.id, isExpanded)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { direction: i18n.dir() }]}>
      <CustomHeader text={t('home.reports_title')} />
      <ListContainer
        loading={loading.reports}
        error={error.reports}
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={onRefresh}
        refreshing={loading.reports}
        contentContainerStyle={styles.listContent}
        emptyListMessage={t('home.no_doctor_reports_found')}
      />
      {reports.length > 0 && !loading.reports && (
        <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={styles.ele}>
          <Image source={areAllExpanded ? Images.shrink : Images.r6} />
        </TouchableOpacity>
      )}
      {/* Add report button */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('addReport')}>
        <Image source={Images.add} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Reports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  listContent: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    gap: hp(1.2),
  },
  ele: {
    position: 'absolute',
    bottom: hp(10),
    left: wp(10),
  },
  addButton: {
    position: 'absolute',
    bottom: hp(3),
    right: wp(5),
  },
});