import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/authContext';
import { Icons } from './Icons';

export const HomeHeader = ({ showUserInfo = true }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const userName = user?.user?.name;

  return (
    <View style={[styles.headerContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>

      {/* Menu button */}
      <TouchableOpacity onPress={() => navigation.getParent()?.toggleDrawer()}>
        <Icons.Menu width={24} height={24} color="#000" />
      </TouchableOpacity>

      {/* Greeting */}
      {showUserInfo && (
        <View style={[styles.greetingContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.txt1} numberOfLines={1}>
            {t('home.hello')}{' '}
            <Text style={styles.txt2}>{userName || ''}</Text>
            <Text style={{ color: '#888888' }}>!</Text>
          </Text>
          <Icons.Wave width={24} height={24} color="#888888" style={styles.waveIcon} />
        </View>
      )}

      {/* Action icons */}
      <View style={[styles.actionsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icons.Notification width={24} height={24} color="#000" style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileStack')}>
          {user?.user?.avatar ? (
            <Image source={{ uri: user.user.avatar }} style={styles.profileImage} />
          ) : (
            <Icons.Profilea width={40} height={40} imageUrl={user?.user?.avatar} />
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 100,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
  },
  txt1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  txt2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888888',
  },
  greetingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  waveIcon: {
    width: 24,
    height: 24,
    margin: 5,
  },
  actionsContainer: {
    alignItems: 'center',
    gap: 15,
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
});

export default HomeHeader;
