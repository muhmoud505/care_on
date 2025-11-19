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
        styles.container
      ]}
      edges={['top']} // Ensure proper safe area handling
    >
      <TouchableOpacity 
        style={[styles.touchable, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        onPress={() => navigation.goBack()}
      >
        <Image 
          source={require('../assets2/images/Vector.png')}
          style={[styles.icon, isRTL && { transform: [{ scaleX: -1 }] }]}
        />
        <Text style={styles.text}>
          {text}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: hp(12),
    justifyContent: 'center',
  },
  touchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: wp(3),
    paddingHorizontal: wp(6),
  },
  text: {
    fontWeight: 'bold',
    fontSize: Math.min(wp(4.5), 18),
  },
  icon: {
    width: wp(2.5),
    height: hp(2.2),
  },
});

export default CustomHeader;