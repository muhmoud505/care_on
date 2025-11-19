import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import CollapsibleCard from './CollapsibleCard';

const Report = ({ 
  title,  
  date, 
  description,
  doctorName, // Add doctorName to props
  expanded,
  onExpandedChange,
  icon
}) => {

  const { t } = useTranslation();
  return (
    <CollapsibleCard
      title={title}
      icon={icon}
      isExpanded={expanded}
      onToggle={onExpandedChange}
    >
      <>
        <View style={styles.miccontianer}>
          <Image source={require('../assets2/images/r2.png')} />
          <Text style={styles.txt2}>{t('report.doctor_name')}:</Text>
          <Text style={styles.txt3}>{doctorName}</Text>
        </View>
        <View style={styles.miccontianer}>
          <Image source={require('../assets2/images/r4.png')} />
          <Text style={styles.txt2}>{t('report.report_date')}:</Text>
          <Text style={styles.txt3}>{date}</Text>
        </View>
        <View style={styles.miccontianer}>
          <Image source={require('../assets2/images/r5.png')} />
          <Text style={styles.txt2}>{t('result.description')}:</Text>
          <Text style={styles.txt3}>{description}</Text>
        </View>
        <ImageBackground 
          source={require('../assets2/images/backg.png')}
          style={styles.background}
          imageStyle={{width:319, height:61}}
          resizeMode='cover'
        >
          <View style={styles.overlay}>
            <Image source={require('../assets2/images/download.png')} />
            <Text style={styles.txt4}>{t('common.download')}</Text>
          </View>
        </ImageBackground>
      </>
    </CollapsibleCard>
  )
}

export default Report

const styles = StyleSheet.create({
  container: {
    direction: 'rtl',
    width: '100%',
    height: '100%',
    gap: 10
  },
  miccontianer: {
    flexDirection: 'row',
    columnGap: 5,
    margin: 10
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
  }
});