import { useTranslation } from 'react-i18next';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text } from 'react-native';
import Images from '../../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const SplashScreen = () => {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  
  return (
    <SafeAreaView style={[styles.container,{direction: i18n.dir()}]}>
      <Image source={Images.logo}/>
      <Text style={styles.text}>
        <Text style={{color: '#014CC4'}}>Rayaa </Text>
        <Text style={{color: '#80D280'}}>360</Text>
      </Text>
      {/* <Test/> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  text: {
    marginTop: -hp(12),
    fontSize: Math.min(wp(16), 64),
    fontFamily: "Nunito",
    fontWeight: '700',
    lineHeight: hp(12)
  }
});

export default SplashScreen;