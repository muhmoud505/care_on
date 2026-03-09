import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '../../constants2/images';
import { useAuth } from '../../contexts/authContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { setSession } = useAuth();

  const { sessionData } = route.params || {};

  const handleContinue = async () => {
    if (sessionData) {
      // Call setSession HERE — only when the user explicitly taps Continue.
      // This ensures the root navigator doesn't switch stacks before this screen mounts.
      await setSession(sessionData);
    }
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'home' }] })
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Image source={images.confirmed} />
          <Text style={styles.text}>{t('welcome.registered_successfully')}</Text>
          <Text style={styles.text}>
            {t('welcome.welcome_to')}{' '}
            <Text style={{ color: '#014CC4' }}>{t('Care')}</Text>{' '}
            <Text style={{ color: '#80D280' }}>{t('On')}</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={handleContinue}>
          <Text style={styles.nextButtonText}>{t('common.continue')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: hp(1),
  },
  text: {
    fontSize: Math.min(wp(8), 32),
    fontWeight: '700',
    lineHeight: hp(8),
  },
  nextButton: {
    backgroundColor: '#014CC4',
    height: hp(7),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(90),
    position: 'absolute',
    bottom: hp(10),
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(6), 24),
  },
});

export default WelcomeScreen;
