import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/CustomHeader';
import Medicine from '../../components/medicineComponent';
import Images from '../../constants2/images';
import { hp, wp } from '../../utils/responsive';

const Medicines = () => {
  const [data, setData] = useState([
    {
      id: '1',
      title: 'Augmentin 1 gm',
      dose: 'مرتين يوميا',
      from: '09/05/2025',
      to: '15/05/2025',
      icon: Images.medicine,
    },
    // Add more medicine items here
  ]);

  const navigation=useNavigation()
  const route = useRoute();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Check if a new medicine was passed back from the Add screen
    if (route.params?.newMedicine) {
      const newMedicine = { ...route.params.newMedicine, icon: Images.medicine };
      setData(prevData => [newMedicine, ...prevData]);
      // Clear the parameter so it's not added again on re-render
      navigation.setParams({ newMedicine: null });
    }
  }, [route.params?.newMedicine]);

  const renderItem = ({ item }) => (
    <Medicine
      title={item.title}
      dose={item.dose}
      from={item.from}
      to={item.to}
      icon={item.icon}
    />
  );

  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      
      
      <CustomHeader text={t('home.medicines_title', { defaultValue: 'الادوية' })}/>
      
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Add medication button */}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('add')}>
        <Image source={Images.add} />
      </TouchableOpacity>
      
     
      <StatusBar barStyle={'dark-content'}  backgroundColor="transparent"  />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: hp(1.2),
  },
  smcontainer: {
    width: '100%',
    borderRadius: wp(3),
    backgroundColor: '#FFF',
    padding: wp(4),
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: hp(10), // Ensure space for the add button
  },
  mincontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: hp(1.2)
  },
  expandedContent: {
    paddingTop: hp(1.2),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.2),
  },
  detailItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: wp(2),
  },
  txt1: {
    fontWeight: '900',
    fontSize: Math.min(wp(4), 16),
    color: "#014CC4"
  },
  txt2: {
    fontWeight: '600',
    fontSize: Math.min(wp(3.5), 14),
    color: '#555555',
    textAlign: 'right',
  },
  txt3: {
    fontWeight: '500',
    fontSize: Math.min(wp(3.5), 14),
    color: '#000000',
    textAlign: 'right',
  },
  addButton: {
    position: 'absolute',
    bottom: hp(3),
    left: wp(5),

  },
  modalContainer: {

    backgroundColor: '#FFF',
    marginTop: StatusBar.currentHeight,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: wp(4),
    padding: 0, // No padding
    width: wp(90),
    maxWidth: wp(100),
    flex:1
  },

  modalTime: {
    fontSize: Math.min(wp(4), 16),
    color: '#555',
  },
  formTitle: {
    fontSize: Math.min(wp(4), 16),
    color: '#555',
    textAlign: 'right',
    marginBottom: hp(2.5),
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  inputLabel: {
    fontSize: Math.min(wp(3.5), 14),
    color: '#333',
    marginBottom: hp(0.6),
    textAlign: 'right',
  },
  inputField: {
    backgroundColor: '#F5F5F5',
    borderRadius: wp(2),
    padding: wp(3),
    fontSize: Math.min(wp(3.5), 14),
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#014CC4',
    borderRadius: wp(2),
    padding: wp(4),
    alignItems: 'center',
    marginTop: hp(1.2),
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(4), 16),
  },
  closeButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: wp(2),
    padding: wp(4),
    alignItems: 'center',
    marginTop: hp(1.2),
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: Math.min(wp(4), 16),
  },
});

export default Medicines;