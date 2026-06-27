import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CollapsibleCard from './CollapsibleCard';
import { Icons } from './Icons';

const Eshaa = ({
  title,
  labName,
  date,
  description,
  expanded,
  onExpandedChange,
  icon,
  fileUrl,
  radiologyExamsDisplay,
}) => {
  const { t } = useTranslation();

  // Parse the description if it's a JSON string
  let parsedDescription = { labName: '', notes: '', date: '' };
  if (description && typeof description === 'string' && description.startsWith('{')) {
    try {
      parsedDescription = JSON.parse(description);
    } catch (e) {
      parsedDescription.notes = description;
    }
  } else {
    parsedDescription.notes = description || '';
  }

  const displayNotes = parsedDescription.notes || '';

  const handleDownload = async () => {
    if (!fileUrl) return;

    try {
      const rawName = fileUrl.split('/').pop().split('?')[0] || 'download';
      const ext = rawName.split('.').pop().toLowerCase() || 'pdf';
      const baseName = rawName.replace(/\.[^/.]+$/, '');
      const fileName = `${baseName}.${ext}`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(fileUrl, fileUri);
      const result = await downloadResumable.downloadAsync();

      if (!result || result.status !== 200) {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('common.download_failed', { defaultValue: 'Download failed' }),
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }

      const { uri } = result;

      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri);
          Toast.show({
            type: 'success',
            text1: t('common.success'),
            text2: t('common.file_saved', { defaultValue: 'File saved successfully' }),
            position: 'top',
            visibilityTime: 3000,
          });
          return;
        }
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('common.sharing_not_available', { defaultValue: 'Sharing not available' }),
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }
      await Sharing.shareAsync(uri);

    } catch (err) {
      console.error('Download error:', err);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.download_failed', { defaultValue: 'Download failed' }),
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <CollapsibleCard
      title={title}
      icon={icon}
      isExpanded={expanded}
      onToggle={onExpandedChange}
    >
      <>
        {/* X-ray name row */}
        <View style={styles.miccontianer}>
          <Icons.Union width={20} height={20} />
          <Text style={styles.txt2}>{t('eshaa.xray_name')}:</Text>
          <Text style={styles.txt3}>{title}</Text>
        </View>

        {/* Description row */}
        <View style={styles.miccontianer}>
          <Icons.ReceiptEdit width={20} height={20} />
          <Text style={styles.txt2}>{t('eshaa.description')}:</Text>
          <Text style={[styles.txt3, { flexShrink: 1 }]}>{displayNotes}</Text>
        </View>

        {/* Required scans row */}
        {!!radiologyExamsDisplay && (
          <View style={styles.miccontianer}>
            <Icons.Union width={20} height={20} />
            <Text style={styles.txt2}>{t('report.required_scans', { defaultValue: 'الاشعة المطلوبة' })}:</Text>
            <Text style={[styles.txt3, { flexShrink: 1 }]}>{radiologyExamsDisplay}</Text>
          </View>
        )}

        {/* Download button */}
        {!!fileUrl && (
          <TouchableOpacity onPress={handleDownload} activeOpacity={0.8}>
            <ImageBackground
              source={require('../assets2/images/backg.png')}
              style={styles.background}
              imageStyle={{ width: 319, height: 61 }}
              resizeMode="cover"
            >
              <View style={styles.overlay}>
                <Icons.Download width={20} height={20} />
                <Text style={styles.txt4}>{t('common.download')}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      </>
    </CollapsibleCard>
  );
};

export default Eshaa;

const styles = StyleSheet.create({
  miccontianer: {
    flexDirection: 'row',
    columnGap: 5,
    margin: 10,
  },
  txt2: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000000',
  },
  txt3: {
    fontWeight: '500',
    fontSize: 12,
    color: '#000000',
    lineHeight: 20,
    width: '70%',
  },
  txt4: {
    fontWeight: '700',
    fontSize: 14,
    color: '#FFFFFF',
  },
  background: {
    width: '100%',
    height: 61,
    marginTop: 10,
  },
  overlay: {
    backgroundColor: '#00000080',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    borderRadius: 12,
  },
});