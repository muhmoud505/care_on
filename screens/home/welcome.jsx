import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { setSession } = useAuth();

  const { sessionData } = route.params || {};

  return (
    <SafeAreaView >
        <View style={styles.container}>
            <View>
              <Image
                source={images.confirmed}
              />
              <Text style={styles.text}>{t('welcome.registered_successfully')}</Text>
              <Text style={styles.text}>{t('welcome.welcome_to')} <Text style={{color: '#014CC4'}}>{t('Care')}</Text> <Text style={{color: '#80D280'}}>{t('On')}</Text></Text>
            </View>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                if (sessionData) {
                  setSession(sessionData);
                }
              }}
            >
               <Text style={styles.nextButtonText}>{t('common.continue')}</Text>
            </TouchableOpacity>
         </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
    img:{
        width: wp(80),
        height: wp(80),
        
    },
    container:{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        height: '100%'
    },
    txt1:{
        fontWeight:'700',
        fontSize: Math.min(wp(6), 24),
        lineHeight: hp(5),
        textAlign:'center'
    },
    txt2:{
        fontWeight:'700',
        fontSize: Math.min(wp(8), 32),
        lineHeight: hp(6),
        letterSpacing: wp(0.5),
        textAlign:'center',
        width: wp(70)
    },
    text: {
   
    fontSize: Math.min(wp(8), 32),
    fontFamily: "Nunito",
    fontWeight: '700',
    lineHeight: hp(8)
  },
    nextButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
    width: wp(90),
    position: 'absolute',
    bottom: hp(10)
  },
    nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(6), 24),
  },
})
export default WelcomeScreen