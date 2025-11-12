import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Images from '../constants2/images';
import { useAuth } from '../contexts/authContext';

export const HomeHeader=({ showUserInfo = true })=>{
  const {user}=useAuth()
  
  
  const nationalid=user?.user?.resource?.national_number;
  
  
  const navigation=useNavigation()
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const maskedNationalId = nationalid && nationalid.length > 0
    ? `${nationalid.charAt(0)+nationalid.charAt(1)+nationalid.charAt(2)+nationalid.charAt(3)  }${'x'.repeat(nationalid.length - 4)}`
    : '';
  
  return(
    <View style={[styles.headerContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      {/* Left side: Menu button */}
      <TouchableOpacity onPress={() => navigation.getParent()?.toggleDrawer()}>
        <Image style={styles.menuIcon} source={Images.menu} />
      </TouchableOpacity>

      {/* Center: Greeting */}
      {showUserInfo && (
        <View style={[styles.greetingContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.txt1} numberOfLines={1}>
            {t('home.hello')}{' '}
            <Text style={styles.txt2}>{maskedNationalId}</Text>
            <Text style={{ color: '#888888' }}>!</Text>
          </Text>
          <Image source={Images.wave} style={[styles.waveIcon, { [isRTL ? 'marginRight' : 'marginLeft']: 5 }]} />
        </View>
      )}

      {/* Right side: Action icons */}
      <View style={[styles.actionsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          onPress={() => console.log('Navigate to Notifications')}
        >
          <Image source={Images.notification} style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileStack')}
        >
          <Image style={styles.profileImage} source={Images.profile} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container:{
    backgroundColor:'#fff'
  },
  headerContainer: {
    height: 100, // Set your desired header height
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
  },
  txt1: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'black'
  },
  txt2: {
    fontSize: 14,
    fontWeight: 'bold',
    color:'#888888',
  },
  menuIcon: {
    width: 24,
    height: 24,
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
  },
});