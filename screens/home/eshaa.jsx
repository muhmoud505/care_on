import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
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

   // This effect runs every time the screen comes into focus
   useFocusEffect(
    useCallback(() => {
      if (user?.token?.value) {
        fetchEshaas();
      }
    }, [user?.token?.value, fetchEshaas])
  );

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

  // Determine if the toggle button should be visible
  const isToggleButtonVisible = areAllExpanded

  const finalAddButtonStyle = isToggleButtonVisible
    ? styles.addButtonHigh
    : styles.addButtonLow;
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
        <TouchableOpacity activeOpacity={0.8} onPress={toggleAll} style={styles.toggleButton}>
          <Image source={areAllExpanded ? Images.shrink : Images.r6} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={finalAddButtonStyle}
        onPress={() => navigation.navigate('addEshaa')}
      >
        <Image source={Images.add} />
      </TouchableOpacity>
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