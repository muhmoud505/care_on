import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomHeader from '../../components/CustomHeader'
import PaymentComponent from '../../components/PaymentComponent'

const PaymaintScreen = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <SafeAreaView style={{ direction: isRTL ? 'rtl' : 'ltr', flex: 1 }}>
    <CustomHeader text={t('payment.records', { defaultValue: 'سجلات الدفع' })}/>
    <Text style={[styles.txt1, { textAlign: isRTL ? 'right' : 'left' }]}>{t('payment.recent_transactions', { defaultValue: 'معاملاتك الاخيرة' })}</Text>
    <ScrollView contentContainerStyle={styles.container}>
      <PaymentComponent/>
    </ScrollView>
    </SafeAreaView>
  )
}

export default PaymaintScreen

const styles = StyleSheet.create({
    container:{
        paddingHorizontal: 20,
        alignItems: 'center', // Center the PaymentComponent
    },
    txt1:{
        fontWeight:500,
        fontSize:16,
        marginHorizontal:20,
        marginBottom:10
    }
})