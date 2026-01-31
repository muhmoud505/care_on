import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomHeader from '../../../components/CustomHeader';
import Images from '../../../constants2/images';
import { useAuth } from '../../../contexts/authContext';
import { hp, profileStyles as styles, wp } from './profileStyles';

const ParentProfile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, updateUserProfile, setTempAvatar } = useAuth();
  console.log('User data to get avatar:', user);

  const handleImagePick = async (type) => {
    setModalVisible(false);
    try {
      let result;
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('common.error'), t('permissions.camera_required', { defaultValue: 'Camera permission is required' }));
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('avatar', {
          uri: asset.uri,
          name: asset.fileName || `avatar_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });

        // Optimistic preview: show the selected image immediately
        setPreviewAvatar(asset.uri);
        try {
          // Also set a temporary avatar in the global auth state so other UI updates (drawer) reflect immediately
          setTempAvatar(user.user.id, asset.uri);
        } catch (e) {
          console.warn('setTempAvatar failed', e.message);
        }

        await updateUserProfile(user.user.id, formData);
        Alert.alert(t('common.success'), t('profile.photo_updated', { defaultValue: 'Profile photo updated successfully' }));
      }
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
            source={previewAvatar ? { uri: previewAvatar } : (user?.user?.avatar ? { uri: user.user.avatar } : Images.profile)}
            style={styles.profileImg}
            resizeMode="cover"
            />
          <TouchableOpacity style={styles.ele1} onPress={() => setModalVisible(true)}>
          <Image
            source={Images.edit}
            />
          </TouchableOpacity>
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

      {modalVisible && (
        <TouchableOpacity 
          style={localStyles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={localStyles.modalContent}
            onPress={() => {}}
          >
            <TouchableOpacity 
              style={localStyles.closeIconContainer} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={localStyles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.option} onPress={() => setModalVisible(false)}>
              <Text style={[localStyles.optionText, { color: 'red' }]}>{t('profile.delete_photo', { defaultValue: 'حذف الصورة' })}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.option} onPress={() => handleImagePick('camera')}>
              <Text style={localStyles.optionText}>{t('profile.camera_photo', { defaultValue: 'التقط صورة عن طريق الكاميرا' })}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.option} onPress={() => handleImagePick('gallery')}>
              <Text style={localStyles.optionText}>{t('profile.gallery_photo', { defaultValue: 'اختر صورة من المعرض' })}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

export default ParentProfile;

const localStyles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    paddingTop: 50,
    width: '100%',
    marginBottom: hp(9),
  },
  closeIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeIcon: {
    fontSize: 16,
    color: '#000',
  },
  option: {
    paddingVertical: 15,
    alignItems: 'center',
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    color: '#1A1D44',
  },
});