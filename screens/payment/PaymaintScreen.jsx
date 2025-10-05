import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../components/CustomHeader'
import PaymentComponent from '../../components/PaymentComponent'

const PaymaintScreen = () => {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{direction:'rtl'}}>
    <CustomHeader text={t('payment.records', { defaultValue: 'سجلات الدفع' })}/>
    <Text style={styles.txt1}>{t('payment.recent_transactions', { defaultValue: 'معاملاتك الاخيرة' })}</Text>
    < ScrollView  style={[{direction:'rtl'},styles.container]}>
      <PaymentComponent/>
     
    </ ScrollView>
    </SafeAreaView>
  )
}

export default PaymaintScreen

const styles = StyleSheet.create({
    container:{
        width:'95%',
        marginHorizontal:20,
    },
    txt1:{
        fontWeight:500,
        fontSize:16,
        marginHorizontal:20,
        marginBottom:10
    }
})