import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import Eshaa from '../../components/eshaaComponent';
import Images from '../../constants2/images';
import { hp, wp } from '../../utils/responsive';

const Eshaas = () => { 
   const [expandedItems, setExpandedItems] = useState({});
   const { t, i18n } = useTranslation();
   const [data, setData] = useState([
    {
      id: '1',
      title: 'X-ray Arm',
      description: ` Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s`,
      date: '09/05/2025',
      labName: 'معمل الاسراء',
      icon: Images.eshaa
    },
    // Add more data items here if needed
  ]);

  const handleItemExpand = (id, isExpanded) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: isExpanded
    }));
  };

  const areAllExpanded = data.length > 0 && data.every(item => expandedItems[item.id]);

  const toggleAll = () => {
    const nextExpandedState = !areAllExpanded;
    const newExpandedState = data.reduce((acc, item) => {
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
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleAll}
        style={styles.ele}
      >
        <Image source={areAllExpanded ? Images.shrink : Images.r6} />
      </TouchableOpacity>
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
    gap: hp(1.2)
  },
  ele:{
    position:'absolute',
    bottom: hp(10),
    left: wp(10)
  }
});