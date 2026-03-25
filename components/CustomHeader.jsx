import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from './Icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const CustomHeader = ({ text, onBack }) => {
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation(); 
  const isRTL = i18n.dir() === 'rtl'; 
  const navigation = useNavigation();

  const handleBackPress = () => {
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
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  return (
    // We add a key here to force React to re-draw the component when language changes
    <View key={i18n.language} style={[styles.container, { paddingTop: insets.top }]}> 
      <View style={[
        styles.row, 
        { 
          // English: Aligns everything to the Left
          // Arabic: Aligns everything to the Right
          justifyContent: isRTL ? 'flex-start' : 'flex-end'
        }
      ]}>
        <TouchableOpacity
          style={[styles.touchable, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {/* In Arabic, we put the text BEFORE the arrow */}
          {!isRTL && (
            <Text style={[styles.text, { marginRight: wp(3) }]} numberOfLines={1}>
              {text}
            </Text>
          )}

          <Icons.arrleft
            width={wp(6)}
            height={hp(3)}
            style={{ 
              // English: Points Left (<)
              // Arabic: Points Right (>)
              transform: [{ rotate: isRTL ? '180deg' : '0deg' }] 
            }}
          />

          {/* In English, we put the text AFTER the arrow */}
          {isRTL && (
            <Text style={[styles.text, { marginLeft: wp(3) }]} numberOfLines={1}>
              {text}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: hp(11),
    justifyContent: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row', // Base direction is always row
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  touchable: {
    flexDirection: 'row', // Keep items side-by-side
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: Math.min(wp(4.5), 18),
    color: '#000',
  },
});

export default CustomHeader;