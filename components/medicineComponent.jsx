import { useTranslation } from 'react-i18next';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { hp, wp } from '../utils/responsive';
import CollapsibleCard from './CollapsibleCard';

const Medicine = ({
  id,
  title, 
  from, 
  to, 
  description, // This prop contains the dosage value
  icon,
  expanded,
  onExpandedChange
}) => {
      const { t, i18n } = useTranslation();
  return (
    <CollapsibleCard
      title={title}
      icon={icon}
      isExpanded={expanded}
      onToggle={onExpandedChange}
    >
      <View style={styles.expandedContent}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Image source={require('../assets2/images/r3.png')} style={styles.detailIcon} />
            <View style={{flexDirection:'row',columnGap:5}}>
              <Text style={styles.txt2}>{t('medicine.from')}:</Text>
              <Text style={styles.txt3}>{from}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Image source={require('../assets2/images/r3.png')} style={styles.detailIcon} />
            <View style={{flexDirection:'row',columnGap:5}}>
              <Text style={styles.txt2}>{t('medicine.to')}:</Text>
              <Text style={styles.txt3}>{to}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Image source={require('../assets2/images/r5.png')} style={styles.detailIcon} />
            <View style={{flexDirection:'row',columnGap:5}}>
              <Text style={styles.txt2}>{t('medicine.dosage')}:</Text>
              <Text style={styles.txt3}>{description}</Text>
            </View>
          </View>
        </View>
      </View>
    </CollapsibleCard>
  )
}

export default Medicine


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
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  detailIcon: {
    width: wp(5),
    height: wp(5),
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
    textAlign: 'left',
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