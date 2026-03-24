import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CustomHeader from '../../../components/CustomHeader';
import { Icons } from '../../../components/Icons';
import Images from '../../../constants2/images';
import { useAuth } from '../../../contexts/authContext';
import { getDynamicStyles, hp, profileStyles as styles, wp } from './profileStyles';

const ParentProfile = () => {
  const [modalVisible, setModalVisible]   = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [meData, setMeData] = useState(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const ds = getDynamicStyles(isRTL);          // RTL-aware dynamic styles
  const navigation = useNavigation();
  const { user, fetchCurrentUser,refreshToken, updateUserProfile, setTempAvatar, deleteUserAvatar } = useAuth();

  const profileUser = meData || user?.user || {};

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

  /* ── Download birth certificate ── */
  const handleDownloadBirthCertificate = async () => {
    const url =
      user?.user?.resource?.birth_certificate_url ||
      user?.user?.resource?.birth_certificate      ||
      user?.user?.resource?.certificate_url        ||
      user?.user?.resource?.birth_cert_url         ||
      user?.user?.birth_certificate_url            ||
      user?.user?.birth_certificate                ||
      user?.user?.certificate_url                  ||
      user?.user?.birth_cert_url                   ||
      null;

    if (!url) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('common.no_file_to_download'), position: 'top', visibilityTime: 3000 });
      return;
    }
    try {
      const fileUri = `${FileSystem.cacheDirectory}birth_certificate.pdf`;
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

  useEffect(() => {
    refreshToken(); // Ensure token is fresh when profile loads
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const data = await fetchCurrentUser();
        if (isMounted && data) {
          setMeData(data);
        }
      } catch (error) {
        console.warn('ParentProfile fetchCurrentUser failed', error?.message || error);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <CustomHeader text={t('profile.parent_profile_title')} />

      <ScrollView contentContainerStyle={{ paddingBottom: hp(5) }}>

        {/* ── Profile card ── */}
        <View style={localStyles.card}>

          {/* Linked Accounts button — top corner, direction-aware */}
          <TouchableOpacity
            style={[localStyles.linkedBtn, { [isRTL ? 'right' : 'left']: wp(4) }]}
            onPress={() => navigation.navigate('accounts')}
          >
            <Text style={localStyles.linkedBtnText} numberOfLines={1}>
              {t('account.linked_accounts')}
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
            {/* ✅ Edit icon: absolutely positioned at bottom-right of avatar */}
            <TouchableOpacity
              style={localStyles.editIconBtn}
              onPress={() => setModalVisible(true)}
            >
              <View style={localStyles.editIconInner}>
                <Icons.Edita width={wp(10)} height={wp(10)} />
                <Icons.Editb
                  style={localStyles.editbOverlay}
                  width={wp(5)}
                  height={wp(5)}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Name & national ID */}
          <Text style={localStyles.nameText} numberOfLines={1}>
            {profileUser?.name || t('common.user_name_placeholder')}
          </Text>
          <Text style={localStyles.idText}>
            {profileUser?.resource?.national_number || t('common.masked_national_id')}
          </Text>
        </View>

        {/* ── Birth certificate ── */}
        <View style={[localStyles.section, { direction: isRTL ? 'rtl' : 'ltr' }]}>
          <Text style={[localStyles.sectionLabel,{textAlign:isRTL ? 'left' : 'right'}]}>{t('profile.birth_certificate')}</Text>
          <TouchableOpacity onPress={handleDownloadBirthCertificate} style={{ width: '100%' }}>
            <ImageBackground
              source={Images.id}
              style={[styles.background, { width: '100%' }]}
              imageStyle={{ width: wp(90), height: hp(8), borderRadius: 8 }}
              resizeMode="cover"
            >
              <View style={[styles.overlay, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Icons.Download width={wp(6)} height={wp(6)} />
                <Text style={[styles.txt4, { color: '#fff' }]}>{t('common.download')}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── Add another account ── */}
        <TouchableOpacity
          style={[styles.nextButton]}
          onPress={() => navigation.navigate('Auth', { screen: 's2', params: { userType: 'child', isParentAddingChild: true } })}
        >
          <Text style={styles.nextButtonText}>{t('account.add_another_account')}</Text>
        </TouchableOpacity>

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
            <TouchableOpacity style={[localStyles.closeIconContainer, { [isRTL ? 'left' : 'right']: 15 }]} onPress={() => setModalVisible(false)}>
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

export default ParentProfile;

const localStyles = StyleSheet.create({
  /* Profile card at top */
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
  /* Linked Accounts button — absolutely positioned at top corner */
  linkedBtn: {
    position: 'absolute',
    top: hp(1.5),
    backgroundColor: '#014CC4',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: 8,
  },
  linkedBtnText: {
    color: '#fff',
    fontSize: Math.min(wp(3), 12),
    fontWeight: '600',
  },
  /* Avatar */
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
  /* ✅ Edit icon: sits at bottom-right of avatar circle, no overlap with name */
  editIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  nextButton:{
    width: '100%'
  }
  ,editIconInner: {
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
  /* Section */
  section: {
    marginHorizontal: wp(5),
    marginTop: hp(2.5),
    gap: hp(1),
  },
  sectionLabel: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#000',
  },
  /* Modal */
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
    marginBottom: hp(9),
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
