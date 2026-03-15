import { useNavigation } from '@react-navigation/native';
import { Dimensions, I18nManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icons } from './Icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const CustomHeader = ({ text, onBack }) => {
  const isRTL = I18nManager.isRTL;
  const navigation = useNavigation();

  const handleBackPress = () => {
    // Allow parent screen to override back behaviour
    if (onBack) {
      onBack();
      return;
    }

    const state = navigation.getState();
    const prevRoute  = state.routes[state.routes.length - 2]?.name;
    const currentRoute = state.routes[state.routes.length - 1]?.name;

    const isInAccountFlow =
      (prevRoute === 'ProfileStack' && currentRoute === 'accounts') ||
      (prevRoute === 'accounts'     && currentRoute === 'ProfileStack');

    if (isInAccountFlow) {
      try {
        navigation.reset({ index: 0, routes: [{ name: 'App' }] });
      } catch (error) {
        console.error('Navigation error:', error);
      }
    } else {
      navigation.goBack();
    }
  };

  return (
    // ✅ Plain View — no SafeAreaView here.
    // Each screen wraps itself in SafeAreaView so we never double-pad.
    <View style={styles.container}>
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={[styles.touchable, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {/* Arrow flips: RTL keeps original direction, LTR rotates 180° */}
          <Icons.arrleft
            width={wp(6)}
            height={hp(3)}
            style={{ transform: [{ rotate: isRTL ? '0deg' : '180deg' }] }}
          />
          <Text style={styles.text} numberOfLines={1}>
            {text}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: hp(2),
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  row: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  touchable: {
    alignItems: 'center',
    gap: wp(3),
  },
  text: {
    fontWeight: 'bold',
    fontSize: Math.min(wp(4.5), 18),
    flexShrink: 1,
  },
});

export default CustomHeader;
