import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const PaymentComponent = () => {
  const navigation=useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <TouchableOpacity
    onPress={()=>navigation.navigate('payment_status')}
    activeOpacity={0.6}
    >

  <View style={styles.container}>
      <View style={[styles.v1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={{marginTop:hp(1)}}>10 {t('payment.currency')}</Text>
        <View style={{flexDirection: isRTL ? 'row' : 'row-reverse', columnGap:8}}>
            <Text style={styles.txt1}>{t('common.success')}</Text>
            <TouchableOpacity 
              onPress={()=>navigation.navigate('payment_status')}
            >
                <Text style={[styles.navButtonText, isRTL && { transform: [{ scaleX: -1 }] }]}>‹</Text>
            </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.v2, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Image source={require('../assets2/images/pay.png')}/>
        <View style={{rowGap:hp(1.2),top:-hp(1), alignItems: isRTL ? 'flex-end' : 'flex-start'}}>
            <Text style={styles.txt2}>{t('payment.masked_name')}</Text>
            <Text style={[styles.txt2,{color:'black'}]}>{t('payment.masked_phone')}</Text>
        </View>
        <Text style={[styles.txt3, { textAlign: isRTL ? 'left' : 'right' }]}>12 Jul 2025 05:47 PM</Text>
      </View>
    </View>
    </TouchableOpacity>

  )
}

export default PaymentComponent

const styles = StyleSheet.create({
    container:{
        width: wp(90),
        height: hp(14),
        borderRadius: wp(3),
        backgroundColor:'#fff',
        rowGap: hp(2.5),
        marginBottom: hp(1.2)
    },
    v1:{
        paddingHorizontal: wp(2.5),
        justifyContent:'space-between'
    },
    v2:{
        paddingHorizontal: wp(2.5),
        columnGap: wp(2.5),
        justifyContent: 'space-between'
    },
    txt1:{
        backgroundColor:'#80D28040',
        color:'#80D280',
        textAlign:'center',
        borderRadius: wp(0.5),
        width: wp(10),
        height: hp(2.5),
        marginTop: hp(1)
    },
    txt2:{
        fontSize: Math.min(wp(3.3), 13),
        fontWeight:'300',
        color:'#808080'
    },
    txt3:{
        fontSize: Math.min(wp(2.5), 10),
        fontWeight:'300',
        color:'#808080',
        flex: 1,
    },
    navButtonText: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: 'bold',
    color: '#33333380',
  },
})