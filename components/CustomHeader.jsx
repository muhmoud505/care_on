import { useNavigation } from '@react-navigation/native';
import { Dimensions, I18nManager, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/authContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const CustomHeader = ({ text }) => {
  const isRTL = I18nManager.isRTL;
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <SafeAreaView 
      style={[
        styles.container
      ]}
      edges={['top']} // Ensure proper safe area handling
    >
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}> 
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

        {/* <TouchableOpacity onPress={() => navigation.navigate('ProfileStack')}>
          <Image
            source={user?.user?.avatar ? { uri: user.user.avatar } : Images.profile}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity> */}
      </View>
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: wp(3),
    paddingHorizontal: wp(6),
  },
  row: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  avatar: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    overflow: 'hidden',
  },
});

export default CustomHeader;