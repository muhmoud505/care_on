import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import Eshaa from '../../components/eshaaComponent';
import ListContainer from '../../components/ListContainer';
import Medicine from '../../components/medicineComponent';
import Report from '../../components/reportCoponent';
import Result from '../../components/resultComponents';
import { useAuth } from '../../contexts/authContext';
import { useMedicalRecords } from '../../contexts/medicalRecordsContext';

const LastReports = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { allRecords, loading, error, fetchAllRecords } = useMedicalRecords();
  useEffect(() => {
    // Only fetch records if the user object with a token exists.
    if (user?.token) {
      fetchAllRecords();
    }
  }, [user, fetchAllRecords]);

  const renderItem = ({ item }) => {
    switch(item.type) {
      case 'result':
        return <Result {...item} />;
      case 'medicine':
        return <Medicine {...item} />;
      case 'eshaa':
        return <Eshaa {...item} />;
      case 'report':
        return <Report {...item} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      <CustomHeader text={t('home.last_reports_title', { defaultValue: 'التقارير السابقة' })}/>
      <ListContainer
        loading={loading.all}
        error={error.all}
        data={allRecords}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={() => fetchAllRecords({ force: true })}
        refreshing={loading.all}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        emptyListMessage={t('home.no_reports_found', { defaultValue: 'No previous reports found.' })}
      />
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
    padding: 16, // Add some padding around the list items
  },
  separator: {
    height: 12,
  },
});