import { useNavigation } from '@react-navigation/native';
import { Dimensions, I18nManager, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const CustomHeader = ({ text }) => {
  const isRTL = I18nManager.isRTL;
  const navigation=useNavigation()
  
  return (
    <SafeAreaView 
      style={[
        styles.container,
        isRTL ? styles.rtlContainer : styles.ltrContainer
      ]}
      edges={['top']} // Ensure proper safe area handling
    >
      <TouchableOpacity 
        style={styles.touchable}
        onPress={() => navigation.goBack()}
      >
        <Text style={[
          styles.text,
          isRTL ? styles.ltrText : styles.ltrText
        ]}>
          {text}
        </Text>
        <Image 
          source={require('../assets2/images/Vector.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: hp(12),
    flexDirection: 'row',
  },
  rtlContainer: {
    alignItems: 'flex-start',
   direction:'rtl',

  },
  ltrContainer: {
    alignItems: 'flex-end',
   direction:'ltr',

  },
  touchable: {
    width: '100%',
    height: hp(12),
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: wp(3),
    alignItems: 'center',
    paddingRight: wp(6),
  },
  text: {
    fontWeight: 'bold',
    fontSize: Math.min(wp(4.5), 18),
    marginTop: hp(0.5),
  },
  rtlText: {
    textAlign: 'right',
  },
  ltrText: {
    textAlign: 'left',
  },
  icon: {
    width: wp(2.5),
    height: hp(2.2),
  },
});

export default CustomHeader;