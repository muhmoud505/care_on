import { useNavigation } from '@react-navigation/native';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const PaymentComponent = () => {
  const navigation=useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.v1}>
        <Text style={{marginTop:hp(1)}}>10 EGP</Text>
        <View style={{flexDirection:'row',columnGap:8}}>
            <Text style={styles.txt1}>ناجحة</Text>
            <TouchableOpacity 
              onPress={()=>navigation.navigate('payment_status')}
            >
                <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
        </View>
      </View>
      <View style={styles.v2}>
        <Image source={require('../assets2/images/pay.png')}/>
        <View style={{rowGap:hp(1.2),top:-hp(1)}}>
            <Text style={styles.txt2}>جيلان ا*** ج***</Text>
            <Text style={[styles.txt2,{color:'black'}]}>0123456789</Text>
        </View>
        <Text style={styles.txt3}>12 Jul 2025 05:47 PM</Text>
      </View>
    </View>
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
        flexDirection:'row',
        justifyContent:'space-between'
    },
    v2:{
        paddingHorizontal: wp(2.5),
        flexDirection:'row',
        columnGap: wp(2.5)
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
        alignSelf:'flex-end',
        left: -wp(12)
    },
    navButtonText: {
    fontSize: Math.min(wp(5), 20),
    fontWeight: 'bold',
    color: '#33333380',
  },
})