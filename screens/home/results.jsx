import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import ListContainer from '../../components/ListContainer';
import Result from '../../components/resultComponents';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';
import { useMedicalRecords } from '../../contexts/medicalRecordsContext';
import { hp, wp } from '../../utils/responsive';


const Results = () => {
 const [expandedItems, setExpandedItems] = useState({});
 const { t, i18n } = useTranslation();
 const navigation = useNavigation();
 const { user } = useAuth();
 const { results, loading, error, fetchResults } = useMedicalRecords();

 useEffect(() => {
   if (user?.token) {
     fetchResults();
   }
 }, [user, fetchResults]);

  const handleItemExpand = (id, isExpanded) => {
    setExpandedItems(prev => ({ ...prev, [id]: isExpanded }));
  };

  const areAllExpanded = results.length > 0 && results.every(item => expandedItems[item.id]);

  const toggleAll = () => {
    const nextExpandedState = !areAllExpanded;
    const newExpandedState = results.reduce((acc, item) => {
      acc[item.id] = nextExpandedState;
      return acc;
    }, {});
    setExpandedItems(newExpandedState);
  };

  const renderItem = ({ item }) => (
    <Result
      {...item}
      expanded={expandedItems[item.id] || false}
      onExpandedChange={(isExpanded) => handleItemExpand(item.id, isExpanded)}
    />
  );


  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      <CustomHeader text={t('home.results_title', { defaultValue: 'نتائج التحاليل' })}/>
      <ListContainer
        loading={loading.results}
        error={error.results}
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={() => fetchResults({ force: true })}
        refreshing={loading.results}
        contentContainerStyle={styles.listContent}
        emptyListMessage={t('home.no_results_found', { defaultValue: 'No analysis results found.' })}
      />
      {results.length > 0 && !loading.results && (
        <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={styles.ele}>
          <Image source={areAllExpanded ? Images.shrink : Images.r6} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Results;

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
  ele:{
    position:'absolute',
    bottom: hp(10),
    left: wp(10)
  },
});