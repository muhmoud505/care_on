import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import Eshaa from '../../components/eshaaComponent';
import ListContainer from '../../components/ListContainer';
import Images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';
import { useMedicalRecords } from '../../contexts/medicalRecordsContext';
import { hp, wp } from '../../utils/responsive';

const Eshaas = () => { 
   const [expandedItems, setExpandedItems] = useState({});
   const { t, i18n } = useTranslation();
   const navigation = useNavigation();
   const { user } = useAuth();
   const { eshaa, loading, error, fetchEshaas } = useMedicalRecords();

   useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user?.data?.token?.value) {
        fetchEshaas();
      }
    });

    return unsubscribe;
  }, [navigation, user?.data?.token?.value]);

  const onRefresh = useCallback(() => {
    fetchEshaas({ force: true });
  }, [fetchEshaas]);
  
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

  const renderItem = ({ item }) => (
    <Eshaa
      title={item.title}
      description={item.description}
      date={item.date}
      labName={item.labName}
      icon={item.icon}
      expanded={expandedItems[item.id] || false}
      onExpandedChange={(isExpanded) => handleItemExpand(item.id, isExpanded)}
    />
  );

  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      <CustomHeader text={t('home.xray_title', { defaultValue: 'الاشعة' })}/>
      <ListContainer
        loading={loading.eshaa}
        error={error.eshaa}
        data={eshaa}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={onRefresh}
        refreshing={loading.eshaa}
        contentContainerStyle={styles.listContent}
        emptyListMessage={t('home.no_xrays_found', { defaultValue: 'No X-rays found.' })}
      />
      {eshaa.length > 0 && !loading.eshaa && (
        <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={styles.ele}>
          <Image source={areAllExpanded ? Images.shrink : Images.r6} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Eshaas;

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