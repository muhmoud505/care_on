import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../../components/CustomHeader';
import { Icons } from '../../../components/Icons';
import Images from '../../../constants2/images';
import { useAuth } from '../../../contexts/authContext';
import { hp, profileStyles as styles, wp } from './profileStyles';

const AgeDisplay = ({ value, label }) => (
  <View style={{ alignItems: 'center' }}>
    <View style={styles.ele2}>
      <Text style={styles.txt3}>{value}</Text>
    </View>
    <Text style={styles.txt4}>{label}</Text>
  </View>
);

const ChildProfile = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, updateUserProfile, setTempAvatar, deleteUserAvatar } = useAuth();

  const fullName = user?.user?.name || 'User Name';
  const nationalId = user?.user?.resource?.national_number || '';
  const birthdate = user?.user?.resource?.birthdate;

  useEffect(() => {
    console.log('ChildProfile user payload:', user);
    console.log('ChildProfile resource:', user?.user?.resource);
  }, [user]);

  const maskedNationalId = nationalId
    ? `${nationalId.substring(0, 4)}${'x'.repeat(nationalId.length - 4)}`
    : 'xxxx';

  const age = useMemo(() => {
    if (!birthdate) return { years: 0, months: 0, days: 0 };
    try {
      const birthDate = new Date(birthdate);
      if (isNaN(birthDate.getTime())) throw new Error('Invalid date');

      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
      }

      if (months < 0) {
        years--;
        months += 12;
      }
      return { years, months, days };
    } catch {
      return { years: 0, months: 0, days: 0 };
    }
  }, [birthdate]);

  const handleDeletePhoto = async () => {
    setModalVisible(false);
    setPreviewAvatar(null);

    try {
      const result = await deleteUserAvatar(user.user.id);
      if (!result.success) throw new Error(result.error || 'Unknown error');

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('profile.photo_deleted', { defaultValue: 'Profile photo deleted successfully' }),
        position: 'top',
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error?.message || t('common.unknown_error', { defaultValue: 'Something went wrong' }),
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const downloadFile = async (url, filename) => {
    console.log('ChildProfile downloadFile called with URL:', url);
    console.log('ChildProfile user resource data:', user?.user?.resource);

    if (!url) {
      console.log('No URL found, showing error toast');
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.no_file_to_download', { defaultValue: 'No file available to download' }),
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      console.log('Starting download for file:', filename);
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      console.log('File URI:', fileUri);

      const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
      console.log('Download resumable created');

      const { uri } = await downloadResumable.downloadAsync();
      console.log('Download completed, file URI:', uri);

      if (!(await Sharing.isAvailableAsync())) {
        console.log('Sharing not available');
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('common.sharing_not_available', { defaultValue: 'Sharing is not available on this device' }),
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }

      console.log('Sharing file...');
      await Sharing.shareAsync(uri);
      console.log('Share completed');
    } catch (error) {
      console.log('Download error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const handleImagePick = async (type) => {
    setModalVisible(false);
    try {
      let pickerResult;  // Fix #1: renamed to avoid shadowing the updateUserProfile result below

      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: t('permissions.camera_required', { defaultValue: 'Camera permission is required' }),
            position: 'top',
            visibilityTime: 3000,
          });
          return;
        }
        pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      } else {
        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });
      }

      if (!pickerResult || pickerResult.canceled) return;

      if (pickerResult.assets && pickerResult.assets.length > 0) {
        const asset = pickerResult.assets[0];
        const formData = new FormData();
        formData.append('avatar', {
          uri: asset.uri,
          name: asset.fileName || `avatar_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        });

        const previousAvatar = user?.user?.avatar;
        setPreviewAvatar(asset.uri);

        try {
          setTempAvatar(user.user.id, asset.uri);
        } catch (e) {
          console.warn('setTempAvatar failed', e.message);
        }

        // Fix #1: use a different variable name for the update result
        const updateResult = await updateUserProfile(user.user.id, formData);
        if (!updateResult.success) {
          // Roll back on failure
          setPreviewAvatar(previousAvatar);
          try {
            setTempAvatar(user.user.id, previousAvatar);
          } catch (e) {
            console.warn('reverting temp avatar failed', e.message);
          }

          Toast.show({
            type: 'error',
            text1: t('common.error'),
            text2: updateResult.error || t('common.unknown_error', { defaultValue: 'Something went wrong' }),
            position: 'top',
            visibilityTime: 3000,
          });
          return;
        }

        Toast.show({
          type: 'success',
          text1: t('common.success'),
          text2: t('profile.photo_updated', { defaultValue: 'Profile photo updated successfully' }),
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <CustomHeader text={t('profile.child_profile_title', { defaultValue: 'الحساب الشخصي' })} />
      <ScrollView contentContainerStyle={{ paddingBottom: hp(5), paddingTop: hp(2) }}>
        <View style={{ flex: 1 }}>
          <View>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.navigate('accounts')}
            >
              <Text style={styles.btnText}>{t('account.switch_to_parent', { defaultValue: 'انتقال لحساب الأم' })}</Text>
            </TouchableOpacity>
            <View style={styles.cont1}>
              <View style={styles.info}>
                <Image
                  source={
                    previewAvatar
                      ? { uri: previewAvatar }
                      : user?.user?.avatar
                        ? { uri: user.user.avatar }
                        : Images.profile
                  }
                  style={styles.profileImg}
                  resizeMode="cover"
                />
                 <TouchableOpacity style={styles.ele1} onPress={() => setModalVisible(true)}>
                           <View style={{ position: 'relative', width: wp(10), height: wp(10) }}>
                              <Icons.Edita width={wp(10)} height={wp(10)} />
                            <Icons.Editb
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  
                                  transform: [
                                    { translateX: -wp(2) },
                                    { translateY: -wp(3) },
                                  ],
                                  zIndex: 1000,
                                }}
                                width={wp(6)}
                                height={wp(6)}
                              />
                            </View>
                          </TouchableOpacity>
              </View>
              <View style={styles.info}>
                <Text style={styles.txt1} numberOfLines={1}>{fullName}</Text>
                <Text style={styles.txt2}>{maskedNationalId}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cont2}>
            <Text style={styles.txt1}>{t('profile.age_today', { defaultValue: 'العمر لليوم' })}</Text>
            <AgeDisplay value={age.days} label={t('common.day', { defaultValue: 'يوم' })} />
            <AgeDisplay value={age.months} label={t('common.month', { defaultValue: 'شهر' })} />
            <AgeDisplay value={age.years} label={t('common.year', { defaultValue: 'سنة' })} />
          </View>
          <View style={styles.cont3}>
            <View>
              <Text>{t('profile.birth_certificate', { defaultValue: 'شهادة الميلاد' })}</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('ChildProfile birth certificate download button pressed');
                  const url =
                    user?.user?.resource?.birth_certificate_url ||
                    user?.user?.resource?.birth_certificate ||
                    user?.user?.resource?.certificate_url ||
                    user?.user?.resource?.birth_cert_url ||
                    user?.user?.birth_certificate_url ||
                    user?.user?.birth_certificate ||
                    user?.user?.certificate_url ||
                    user?.user?.birth_cert_url ||
                    null;
                  console.log('ChildProfile birth certificate URL found:', url);
                  downloadFile(url, 'birth_certificate.pdf');
                }}
              >
                <ImageBackground
                  source={Images.background}
                  style={[styles.background, { width: wp(90) }]}
                  imageStyle={{ width: wp(90), height: hp(8), borderRadius: 8 }}
                  resizeMode='cover'
                >
                  <View style={styles.overlay}>
                    <Icons.Download width={wp(6)} height={wp(6)} />
                    <Text style={[styles.txt4, { color: '#fff' }]}>{t('common.download', { defaultValue: 'تنزيل' })}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
            <View />
            <Text>{t('profile.uploaded_file', { defaultValue: 'الملف المرفوع سابقا' })}</Text>
            <ImageBackground
              source={Images.background}
              style={[styles.background, { width: wp(90) }]}
              imageStyle={{ width: wp(90), height: hp(8), borderRadius: 8 }}
              resizeMode='cover'
            >
              <View style={styles.overlay}>
                <Icons.Download width={wp(6)} height={wp(6)} />
                <Text style={[styles.txt4, { color: '#fff' }]}>{t('common.download', { defaultValue: 'تنزيل' })}</Text>
              </View>
            </ImageBackground>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('reset')}>
            <Text style={styles.link}>{t('profile.reset_password', { defaultValue: 'اعادة تعيين كلمة السر' })}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            <TouchableOpacity style={localStyles.option} onPress={handleDeletePhoto}>
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
      <Toast />
    </SafeAreaView>
  );
};

AgeDisplay.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

export default ChildProfile;

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
    marginBottom: hp(12),
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    color: '#1A1D44',
  },
});
