import { Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../../components/CustomHeader';
import Images from '../../../constants2/images';
import { useAuth } from '../../../contexts/authContext';
import { hp, profileStyles as styles, wp } from './profileStyles';

const ParentProfile = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  return (
    <SafeAreaView  >
      <CustomHeader text={t('profile.parent_profile_title', { defaultValue: 'الحساب الشخصي' })}/>
      <View>
        <TouchableOpacity style={styles.btn}
        onPress={() => navigation.navigate('accounts')}
        >
            <Text style={styles.btnText}>{t('account.linked_accounts')}</Text>
          </TouchableOpacity>
        <View style={styles.cont1}>
          <View style={styles.info}>

          
           <Image
            source={Images.profile}
            style={styles.profileImg}
            />
          <View style={styles.ele1} >
          <Image
            source={Images.edit}
            />
          </View>
        </View>
        <View style={styles.info} >
        <Text style={styles.txt1} numberOfLines={1}>
          {user?.user?.name || t('drawer.user_name_placeholder', { defaultValue: 'User Name' })}
        </Text>
        <Text style={styles.txt2}>
          {user?.user?.resource?.national_number || t('common.masked_national_id', { defaultValue: 'xxxxxxxxxxxxxx' })}
        </Text> 
        </View>
      </View>
      
      <View style={styles.cont3}>
        <Text>{t('profile.birth_certificate')}</Text>
        <ImageBackground 
           source={Images.id}
             style={[styles.background, {width: wp(90)}]}
              imageStyle={{width:wp(90), height:hp(8),borderRadius:8}}
             resizeMode='cover'
         >
            <View style={styles.overlay}>
               <Image source={Images.download} />
                 <Text style={[styles.txt4,{color:'#fff'}]}>{t('common.download')}</Text>
              </View>
        </ImageBackground>

      </View>
      <TouchableOpacity
        style={styles.nextButton}
        onPress={() =>
          navigation.navigate('Auth', {
            screen: 's2',
            params: {
              userType: 'child',
              isParentAddingChild: true,
            },
          })
        }
                     
      >
        <Text style={styles.nextButtonText}>{t('account.add_another_account')}</Text>
         </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('reset')}>
        <Text style={styles.link}>{t('profile.reset_password')}</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default ParentProfile;