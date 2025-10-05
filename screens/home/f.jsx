import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { I18nManager, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import LanguageSwitch from '../components/switchlng';

const HomeScreen = () => {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container,
        { direction: isRTL ? 'rtl' : 'ltr' }
      ]}
    >
      <LanguageSwitch />
      
      <Text style={styles.title}>{t('welcome')}</Text>
      
      <Text style={styles.paragraph}>{t('intro')}</Text>
      
      <Text style={styles.subtitle}>{t('features.title')}</Text>
      
      {t('features.list', { returnObjects: true }).map((feature, index) => (
        <Text key={index} style={styles.listItem}>
          • {feature}
        </Text>
      ))}
      
      <Text style={styles.paragraph}>
        {t('more', { defaultValue: "This is additional " })}
      </Text>
      <Pressable onPress={()=>router.push('/signin')}><Text>Go to baby</Text></Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left', // Will be flipped to right for RTL
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    textAlign: 'left', // Will be flipped to right for RTL
  },
  listItem: {
    fontSize: 16,
    marginLeft: 15,
    marginBottom: 5,
  },
});

export default HomeScreen;