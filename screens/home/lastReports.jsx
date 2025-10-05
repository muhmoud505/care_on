import { FlatList, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/CustomHeader';
import Eshaa from '../../components/eshaaComponent';
import Medicine from '../../components/medicineComponent';
import Report from '../../components/reportCoponent';
import Result from '../../components/resultComponents';
import Images from '../../constants2/images';


const LastReports = () => {
    const data = [
    {
      id: '1',
      type: 'result',
      title: 'Completed Blood Count (CBC)',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s',
      date: '09/05/2025',
      labName: 'معمل الاسراء',
      icon: Images.n11
    },
    {
      id: '2',
      type: 'medicine',
      title: 'Augmentin 1 gm',
      dose: 'مرتين يوميا',
      from: '09/05/2025',
      to: '09/05/2025',
      icon: Images.n4
    },
    {
      id: '3',
      type: 'eshaa',
      title: 'X-ray Arm',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s',
      date: '09/05/2025',
      labName: 'معمل الاسراء',
      icon: Images.n2
    },
    {
      id: '4',
      type: 'report',
      title: 'دكتور ، 09/05/2025',
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s',
      date: '09/05/2025',
      icon: Images.n3
    }
  ];
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
  const { i18n } = useTranslation();
  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      <CustomHeader text={t('home.reports_title', { defaultValue: 'تقارير الدكاترة' })}/>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
         ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* <Result
        title={'Completed Blood Count (CBC)'}
        description={` Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s`}
        date={'09/05/2025'}
        labName={'معمل الاسراء'}
        icon={require('../../assets2/images/11.png')}
      />
      <Medicine
        title={'Augmentin 1 gm'}
        dose={'مرتين يوميا'}
        from={'09/05/2025'}
        to={'09/05/2025'}
        icon={require('../../assets2/images/4.png')}

      />
      <Eshaa
        title={'X-ray Arm'}
        description={` Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s`}
        date={'09/05/2025'}
        labName={'معمل الاسراء'}
        icon={require('../../assets2/images/2.png')}
      />
      <Report
         title={'دكتور ، 09/05/2025'}
        description={` Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s`}
        date={'09/05/2025'}
       
        icon={require('../../assets2/images/3.png')}

      /> */}
    </SafeAreaView>
  );
};

export default LastReports;

const styles = StyleSheet.create({
  container: {
    direction: 'rtl',
    width: '100%',
    height: '100%',
    gap: 10
  },
  smcontainer: {
    width: '90%',
    borderRadius: 12,
    backgroundColor: '#FFF',
    padding: 10,
    overflow: 'hidden', // Ensures rounded corners clip content
    marginHorizontal:15
  },
  mincontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10 // Add some spacing when expanded
  },
  miccontianer: {
    flexDirection: 'row',
    columnGap: 5,
    margin: 10
  },
  txt1: {
    fontWeight: '900',
    fontSize: 16,
    color: "#014CC4"
  },
  txt2: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000000'
  },
  txt3: {
    fontWeight: '500',
    fontSize: 12,
    color: '#000000',
    lineHeight: 20,
    width: '70%',
  },
  txt4: {
    fontWeight: '700',
    fontSize: 14,
    color: '#FFFFFF'
  },
  background: {
    width: '100%',
    height: 61,
    marginTop: 10
  },
  overlay: {
    backgroundColor: '#00000080',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    borderRadius: 12,
  },
  ele:{
    position:'absolute',
    bottom:"10%",
    left:'10%'
  },
   separator: {
    height: 12,
  },
});