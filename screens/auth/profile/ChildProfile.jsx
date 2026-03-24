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
import { getDynamicStyles, hp, profileStyles as styles, wp } from './profileStyles';

const AgeDisplay = ({ value, label }) => (
  <View style={{ alignItems: 'center' }}>
    <View style={styles.ele2}>
      <Text style={styles.txt3}>{value}</Text>
    </View>
    <Text style={styles.txt4}>{label}</Text>
  </View>
);

const ChildProfile = () => {
  const [modalVisible, setModalVisible]   = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [meData, setMeData] = useState(null);

  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const ds = getDynamicStyles(isRTL);
  const { user, fetchCurrentUser, updateUserProfile, setTempAvatar, deleteUserAvatar } = useAuth();

  const profileUser = meData || user?.user || {};
  const fullName   = profileUser?.name || t('common.user_name_placeholder');
  const nationalId = profileUser?.resource?.national_number || '';
  const birthdate  = profileUser?.resource?.birthdate;

  useEffect(() => {
    console.log('ChildProfile resource:', user);
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        console.log('test 100');
        
        const data = await fetchCurrentUser();
        console.log('test 101 ',data);
        
        if (isMounted && data) {
          setMeData(data);
        }
      } catch (error) {
        console.warn('ChildProfile fetchCurrentUser failed', error?.message || error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser]);

  const maskedNationalId = nationalId
    ? `${nationalId.substring(0, 4)}${'x'.repeat(nationalId.length - 4)}`
    : t('common.masked_national_id');

  const age = useMemo(() => {
    if (!birthdate) return { years: 0, months: 0, days: 0 };
    try {
      const birthDate = new Date(birthdate);
      if (isNaN(birthDate.getTime())) throw new Error('Invalid date');
      const today = new Date();
      let years  = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth()    - birthDate.getMonth();
      let days   = today.getDate()     - birthDate.getDate();
      if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      }
      if (months < 0) { years--; months += 12; }
      return { years, months, days };
    } catch {
      return { years: 0, months: 0, days: 0 };
    }
  }, [birthdate]);

  /* ── Delete photo ── */
  const handleDeletePhoto = async () => {
    setModalVisible(false);
    setPreviewAvatar(null);
    try {
      const result = await deleteUserAvatar(user.user.id);
      if (!result.success) throw new Error(result.error || 'Unknown error');
      Toast.show({ type: 'success', text1: t('common.success'), text2: t('profile.photo_deleted'), position: 'top', visibilityTime: 3000 });
    } catch (error) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: error?.message || t('common.unknown_error'), position: 'top', visibilityTime: 3000 });
    }
  };

  /* ── Download file ── */
  const downloadFile = async (url, filename) => {
    if (!url) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('common.no_file_to_download'), position: 'top', visibilityTime: 3000 });
      return;
    }
    try {
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const { uri } = await FileSystem.createDownloadResumable(url, fileUri).downloadAsync();
      if (!(await Sharing.isAvailableAsync())) {
        Toast.show({ type: 'error', text1: t('common.error'), text2: t('common.sharing_not_available'), position: 'top', visibilityTime: 3000 });
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (error) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: error.message, position: 'top', visibilityTime: 3000 });
    }
  };

  /* ── Pick image ── */
  const handleImagePick = async (type) => {
    setModalVisible(false);
    try {
      let pickerResult;
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({ type: 'error', text1: t('common.error'), text2: t('permissions.camera_required'), position: 'top', visibilityTime: 3000 });
          return;
        }
        pickerResult = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      } else {
        pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      }
      if (!pickerResult || pickerResult.canceled) return;
      if (pickerResult.assets?.length > 0) {
        const asset = pickerResult.assets[0];
        const formData = new FormData();
        formData.append('avatar', { uri: asset.uri, name: asset.fileName || `avatar_${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' });
        const previousAvatar = user?.user?.avatar;
        setPreviewAvatar(asset.uri);
        try { setTempAvatar(user.user.id, asset.uri); } catch (e) { console.warn('setTempAvatar failed', e.message); }
        const updateResult = await updateUserProfile(user.user.id, formData);
        if (!updateResult.success) {
          setPreviewAvatar(previousAvatar);
          try { setTempAvatar(user.user.id, previousAvatar); } catch (e) { console.warn('reverting failed', e.message); }
          Toast.show({ type: 'error', text1: t('common.error'), text2: updateResult.error || t('common.unknown_error'), position: 'top', visibilityTime: 3000 });
          return;
        }
        Toast.show({ type: 'success', text1: t('common.success'), text2: t('profile.photo_updated'), position: 'top', visibilityTime: 3000 });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: error.message, position: 'top', visibilityTime: 3000 });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <CustomHeader text={t('profile.child_profile_title')} />

      <ScrollView contentContainerStyle={{ paddingBottom: hp(5) }}>

        {/* ── Profile card ── */}
        <View style={localStyles.card}>

          {/* Switch to parent button — top corner, direction-aware */}
          <TouchableOpacity
            style={[localStyles.switchBtn, { [isRTL ? 'right' : 'left']: wp(4) }]}
            onPress={() => navigation.navigate('accounts')}
          >
            <Text style={localStyles.switchBtnText} numberOfLines={1}>
              {t('account.switch_to_parent')}
            </Text>
          </TouchableOpacity>

          {/* Avatar + edit icon */}
          <View style={localStyles.avatarWrapper}>
            <Image
              source={
                previewAvatar
                  ? { uri: previewAvatar }
                  : user?.user?.avatar
                    ? { uri: user.user.avatar }
                    : Images.profile
              }
              style={localStyles.avatar}
              resizeMode="cover"
            />
            {/* ✅ Edit icon: clean absolute position at bottom-right of avatar */}
            <TouchableOpacity style={localStyles.editIconBtn} onPress={() => setModalVisible(true)}>
              <View style={localStyles.editIconInner}>
                <Icons.Edita width={wp(10)} height={wp(10)} />
                <Icons.Editb style={localStyles.editbOverlay} width={wp(5)} height={wp(5)} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Name & masked national ID */}
          <Text style={localStyles.nameText} numberOfLines={1}>{fullName}</Text>
          <Text style={localStyles.idText}>{maskedNationalId}</Text>
        </View>

        {/* ── Age today ── */}
        <View style={[styles.cont2, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.txt1}>{t('profile.age_today')}</Text>
          <AgeDisplay value={age.days}   label={t('common.day')}   />
          <AgeDisplay value={age.months} label={t('common.month')} />
          <AgeDisplay value={age.years}  label={t('common.year')}  />
        </View>

        {/* ── Birth certificate ── */}
        <View style={[ds.cont3, { gap: hp(1) }]}>
          <Text style={[styles.txt1, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.birth_certificate')}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const url =
                user?.user?.resource?.birth_certificate_url ||
                user?.user?.resource?.birth_certificate      ||
                user?.user?.resource?.certificate_url        ||
                user?.user?.resource?.birth_cert_url         ||
                user?.user?.birth_certificate_url            ||
                user?.user?.birth_certificate                ||
                null;
              downloadFile(url, 'birth_certificate.pdf');
            }}
          >
            <ImageBackground
              source={Images.background}
              style={[styles.background, { width: wp(90) }]}
              imageStyle={{ width: wp(90), height: hp(8), borderRadius: 8 }}
              resizeMode="cover"
            >
              <View style={[styles.overlay, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Icons.Download width={wp(6)} height={wp(6)} />
                <Text style={[styles.txt4, { color: '#fff' }]}>{t('common.download')}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          <Text style={[styles.txt1, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.uploaded_file')}
          </Text>
          <ImageBackground
            source={Images.background}
            style={[styles.background, { width: wp(90) }]}
            imageStyle={{ width: wp(90), height: hp(8), borderRadius: 8 }}
            resizeMode="cover"
          >
            <View style={[styles.overlay, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Icons.Download width={wp(6)} height={wp(6)} />
              <Text style={[styles.txt4, { color: '#fff' }]}>{t('common.download')}</Text>
            </View>
          </ImageBackground>
        </View>

        {/* ── Reset password ── */}
        <TouchableOpacity onPress={() => navigation.navigate('reset')}>
          <Text style={[styles.link, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.reset_password')}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Photo options modal ── */}
      {modalVisible && (
        <TouchableOpacity style={localStyles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={localStyles.modalContent} onPress={() => {}}>
            <TouchableOpacity
              style={[localStyles.closeIconContainer, { [isRTL ? 'left' : 'right']: 15 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={localStyles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.option} onPress={handleDeletePhoto}>
              <Text style={[localStyles.optionText, { color: 'red' }]}>{t('profile.delete_photo')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.option} onPress={() => handleImagePick('camera')}>
              <Text style={localStyles.optionText}>{t('profile.camera_photo')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.option} onPress={() => handleImagePick('gallery')}>
              <Text style={localStyles.optionText}>{t('profile.gallery_photo')}</Text>
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
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: hp(6),
    paddingBottom: hp(2),
    marginHorizontal: wp(5),
    marginTop: hp(1),
    borderRadius: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  switchBtn: {
    position: 'absolute',
    top: hp(1.5),
    backgroundColor: '#80D280',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: 8,
  },
  switchBtnText: {
    color: '#fff',
    fontSize: Math.min(wp(3), 12),
    fontWeight: '700',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: hp(1.5),
  },
  avatar: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    overflow: 'hidden',
  },
  editIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  editIconInner: {
    width: wp(10),
    height: wp(10),
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editbOverlay: {
    position: 'absolute',
  },
  nameText: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#000',
    marginTop: hp(0.5),
  },
  idText: {
    fontSize: wp(3.5),
    color: '#999',
    marginTop: hp(0.3),
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeIcon: { fontSize: 16, color: '#000' },
  option: {
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: { fontSize: 18, color: '#1A1D44' },
});
