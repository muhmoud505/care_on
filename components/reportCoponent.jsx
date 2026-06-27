import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CollapsibleCard from './CollapsibleCard';
import { Icons } from './Icons';

const parseDescription = (description) => {
  const empty = { date: '', requiredTests: '', requiredScans: '', diagnosis: '', notes: '' };

  if (!description || typeof description !== 'string') return empty;

  const trimmed = description.trim();

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        date:          parsed.date          || '',
        requiredTests: parsed.RequiredTests || parsed.requiredTests || '',
        requiredScans: parsed.RequiredScans || parsed.requiredScans || '',
        diagnosis:     (parsed.diagnosis && parsed.diagnosis !== 'None') ? parsed.diagnosis : '',
        notes:         (parsed.notes     && parsed.notes     !== 'None') ? parsed.notes     : '',
      };
    } catch (_e) {
      // Not valid JSON — fall through and treat as plain text notes
    }
  }

  return { ...empty, notes: trimmed };
};

const Report = ({
  title,
  date,
  description,
  doctorName,
  requiredScans,
  requiredTests,
  expanded,
  onExpandedChange,
  icon,
  fileUrl,
  documents,
  lab_tests,
  radiology_exams,
  TYPE,
}) => {
  const { t } = useTranslation();

  const parsed = parseDescription(description);

  const displayDoctorName    = doctorName    || '';
  const displayDate          = date          || parsed.date          || '';
  const displayRequiredTests = requiredTests || parsed.requiredTests || '';
  const displayRequiredScans = requiredScans || parsed.requiredScans || '';
  const displayDiagnosis     = parsed.diagnosis || '';
  const displayNotes         = parsed.notes     || '';

  const getLabTestsDisplay = () => {
    if (lab_tests && Array.isArray(lab_tests) && lab_tests.length > 0) {
      return lab_tests.map(test => test.name).join(', ');
    }
    return displayRequiredTests;
  };

  const getRadiologyExamsDisplay = () => {
    if (radiology_exams && Array.isArray(radiology_exams) && radiology_exams.length > 0) {
      return radiology_exams.map(exam => exam.name).join(', ');
    }
    return displayRequiredScans;
  };

  const labTestsDisplay       = getLabTestsDisplay();
  const radiologyExamsDisplay = getRadiologyExamsDisplay();

  const resolvedFileUrl =
    fileUrl ||
    (Array.isArray(documents) && documents.length > 0 ? documents[0]?.url : null);

  const handleDownload = async () => {
    if (!resolvedFileUrl) return;

    try {
      // Detect extension from URL dynamically
      const rawName = resolvedFileUrl.split('/').pop().split('?')[0] || 'download';
      const ext = rawName.split('.').pop().toLowerCase() || 'pdf';
      const baseName = rawName.replace(/\.[^/.]+$/, '');
      const fileName = `${baseName}.${ext}`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(resolvedFileUrl, fileUri);
      const result = await downloadResumable.downloadAsync();

      // Check HTTP status
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

      // Android: try MediaLibrary first
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
        // Permission denied — fall through to share sheet
      }

      // iOS or Android (permission denied): share sheet
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
      TYPE={TYPE}
      showType={true}
    >
      <>
        {!!displayDoctorName && (
          <View style={styles.miccontianer}>
            <Icons.Doctor width={20} height={20} />
            <Text style={styles.txt2}>{t('report.doctor_name')}:</Text>
            <Text style={styles.txt3}>{displayDoctorName}</Text>
          </View>
        )}

        {!!labTestsDisplay && (
          <View style={styles.miccontianer}>
            <Icons.analysisA width={20} height={20} />
            <Text style={styles.txt2}>{t('report.required_tests', { defaultValue: 'التحليل المطلوب' })}:</Text>
            <Text style={styles.txt3}>{labTestsDisplay}</Text>
          </View>
        )}

        {!!radiologyExamsDisplay && (
          <View style={styles.miccontianer}>
            <Icons.Union width={20} height={20} />
            <Text style={styles.txt2}>{t('report.required_scans', { defaultValue: 'الاشعة المطلوبة' })}:</Text>
            <Text style={styles.txt3}>{radiologyExamsDisplay}</Text>
          </View>
        )}

        {!!displayDiagnosis && (
          <View style={styles.miccontianer}>
            <Icons.ReceiptEdit width={20} height={20} />
            <Text style={styles.txt2}>{t('report.diagnosis', { defaultValue: 'التشخيص' })}:</Text>
            <Text style={[styles.txt3, { flexShrink: 1 }]}>{displayDiagnosis}</Text>
          </View>
        )}

        {!!displayNotes && (
          <View style={styles.miccontianer}>
            <Icons.ReceiptEdit width={20} height={20} />
            <Text style={styles.txt2}>{t('report.medical_notes', { defaultValue: 'الوصف الطبي' })}:</Text>
            <Text style={[styles.txt3, { flexShrink: 1 }]}>{displayNotes}</Text>
          </View>
        )}

        {!!resolvedFileUrl && (
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

export default Report;

const styles = StyleSheet.create({
  container: {
    direction: 'rtl',
    width: '100%',
    height: '100%',
    gap: 10,
  },
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
  ele: {
    position: 'absolute',
    bottom: '10%',
    left: '10%',
  },
});