import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CollapsibleCard from './CollapsibleCard';
import { Icons } from './Icons';

/**
 * Parses the description field into a structured object.
 *
 * New records: JSON string like:
 *   '{"date":"9/3/2026","RequiredTests":"تحليل دم","RequiredScans":"اشعة x ray","diagnosis":"شك","notes":"ملاحظة"}'
 *
 * Legacy records: plain text string — treated as a plain notes value.
 *
 * Always returns:
 *   { date, requiredTests, requiredScans, diagnosis, notes }
 */
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

  // Legacy plain-text description: show it as-is in the notes row
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
  TYPE
}) => {
  const { t } = useTranslation();

  // Parse structured fields out of the description string
  const parsed = parseDescription(description);


  // Prop-level values take priority; fall back to what's inside the description JSON
  const displayDoctorName    = doctorName    || '';
  const displayDate          = date          || parsed.date          || '';
  const displayRequiredTests = requiredTests || parsed.requiredTests || '';
  const displayRequiredScans = requiredScans || parsed.requiredScans || '';
  const displayDiagnosis     = parsed.diagnosis || '';
  const displayNotes         = parsed.notes     || '';

  // Support both direct fileUrl prop and documents array
  const resolvedFileUrl =
    fileUrl ||
    (Array.isArray(documents) && documents.length > 0 ? documents[0]?.url : null);

  const handleDownload = async () => {
    if (!resolvedFileUrl) return;

    try {
      const fileName = resolvedFileUrl.split('/').pop().split('?')[0] || 'download';
      const fileUri = FileSystem.documentDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(resolvedFileUrl, fileUri);

      if (Platform.OS === 'android') {
        try {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            await FileSystem.StorageAccessFramework
              .createFileAsync(permissions.directoryUri, fileName, 'application/octet-stream')
              .then(async (createdUri) => {
                await FileSystem.writeAsStringAsync(createdUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                Toast.show({
                  type: 'success',
                  text1: t('common.success'),
                  text2: t('common.file_saved', { defaultValue: 'File saved successfully' }),
                  position: 'top',
                  visibilityTime: 3000,
                });
              })
              .catch(e => {
                console.error(e);
                Toast.show({
                  type: 'error',
                  text1: t('common.error'),
                  text2: t('common.download_failed', { defaultValue: 'Download failed' }),
                  position: 'top',
                  visibilityTime: 3000,
                });
              });
          } else {
            await Sharing.shareAsync(uri);
          }
        } catch (permissionError) {
          console.error('Permission error:', permissionError);
          await Sharing.shareAsync(uri);
        }
      } else {
        await Sharing.shareAsync(uri);
      }
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
        {/* اسم الدكتور */}
        {!!displayDoctorName && (
          <View style={styles.miccontianer}>
            <Icons.Doctor width={20} height={20} />
            <Text style={styles.txt2}>{t('report.doctor_name')}:</Text>
            <Text style={styles.txt3}>{displayDoctorName}</Text>
          </View>
        )}

        {/* التاريخ */}
        {!!displayDate && (
          <View style={styles.miccontianer}>
            <Icons.Calendara width={20} height={20} />
            <Text style={styles.txt2}>{t('report.report_date')}:</Text>
            <Text style={styles.txt3}>{displayDate}</Text>
          </View>
        )}

        {/* التحاليل المطلوبة */}
        {!!displayRequiredTests && (
          <View style={styles.miccontianer}>
            <Icons.analysisA width={20} height={20} />
            <Text style={styles.txt2}>{t('report.required_tests', { defaultValue: 'التحليل المطلوب' })}:</Text>
            <Text style={styles.txt3}>{displayRequiredTests}</Text>
          </View>
        )}

        {/* الاشعة المطلوبة */}
        {!!displayRequiredScans && (
          <View style={styles.miccontianer}>
            <Icons.Union width={20} height={20} />
            <Text style={styles.txt2}>{t('report.required_scans', { defaultValue: 'الاشعة المطلوبة' })}:</Text>
            <Text style={styles.txt3}>{displayRequiredScans}</Text>
          </View>
        )}

        {/* التشخيص */}
        {!!displayDiagnosis && (
          <View style={styles.miccontianer}>
            <Icons.ReceiptEdit width={20} height={20} />
            <Text style={styles.txt2}>{t('report.diagnosis', { defaultValue: 'التشخيص' })}:</Text>
            <Text style={[styles.txt3, { flexShrink: 1 }]}>{displayDiagnosis}</Text>
          </View>
        )}

        {/* الوصف الطبي */}
        {!!displayNotes && (
          <View style={styles.miccontianer}>
            <Icons.ReceiptEdit width={20} height={20} />
            <Text style={styles.txt2}>{t('report.notes', { defaultValue: 'الوصف الطبي' })}:</Text>
            <Text style={[styles.txt3, { flexShrink: 1 }]}>{displayNotes}</Text>
          </View>
        )}

        {/* تنزيل */}
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
