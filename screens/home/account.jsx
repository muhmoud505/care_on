import { useNavigation } from '@react-navigation/native';
import {
  Dimensions,
  I18nManager,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,

  View
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import Images from '../../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

// Enable RTL for Arabic
I18nManager.forceRTL(true);

const Account = () => {
  const type='child'
  const navigation = useNavigation();
  // TODO: Replace with actual user data and logic
  const handleLogin = () => {
    console.log('Login pressed');
  };

  const handleAddAccount = () => {
    // To navigate to a screen in a nested navigator, you must specify the parent navigator's name first.
    // Here, 'auth' is the navigator and 's2' is the screen within it.
    navigation.navigate('auth', {
      screen: 's2',
      params: { userType: 'child', isParentAddingChild: true },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader text="الحسابات المرتبطة" />
      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Image source={Images.profile} style={styles.avatarImage} />
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.phoneNumber}>053xxxxxxxxx</Text>
            <Text style={styles.userName}>مشارك أبشر حالل</Text>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>تمثيل المستخدم</Text>
          </TouchableOpacity>
        </View>

        {/* Add Account Button */}
        <TouchableOpacity
          style={styles.addAccountButton}
          onPress={handleAddAccount}
        >
          <Text style={styles.addAccountText}>إضافة حساب آخر</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Account

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: wp(4),
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    columnGap:wp(5),
    borderRadius: wp(3),
    justifyContent:'center',
  
    alignItems: 'center',
    shadowColor: '#000',
    paddingTop:hp(2),
    shadowOffset: {
      width: 0,
      height: 2,

    },
    flexDirection:'row',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(10),
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
    overflow: 'hidden', // To keep the image within the circle
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: hp(3),
    flexDirection:'column-reverse',
  },
  phoneNumber: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(1),
  },
  userName: {
    fontSize: wp(3.2),
    color: '#333',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    bottom:hp(1.5)
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: wp(3),
    fontWeight: '600',
  },
  addAccountButton: {
    backgroundColor: '#81C784',
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  addAccountText: {
    color: '#FFFFFF',
    fontSize: wp(4),
    fontWeight: '600',
  },
});