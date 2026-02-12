import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import CollapsibleCard from './CollapsibleCard';

const Result = ({ 
  title, 
  labName, 
  date, 
  description, 
  expanded, 
  onExpandedChange,
  icon,
  fileUrl
}) => {
  const { t } = useTranslation();

  const handleDownload = async () => {
    if (!fileUrl) return;

    try {
      const fileName = fileUrl.split('/').pop().split('?')[0] || 'download';
      const fileUri = FileSystem.documentDirectory + fileName;
      
      const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
      
      if (Platform.OS === 'android') {
        try {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/octet-stream')
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
      console.error("Download error:", err);
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
                   <View style={styles.miccontianer}>
                     <Image source={require('../assets2/images/r2.png')} />
                     <Text style={styles.txt2}>{t('result.analysis_name')}:</Text>
                     <Text style={styles.txt3}>{title}</Text>
                   </View>
                   <View style={styles.miccontianer}>
                     <Image source={require('../assets2/images/r3.png')} />
                     <Text style={styles.txt2}>{t('result.lab_name')}:</Text>
                     <Text style={styles.txt3}>{labName}</Text>
                   </View>
                   <View style={styles.miccontianer}>
                     <Image source={require('../assets2/images/r4.png')} />
                     <Text style={styles.txt2}>{t('result.analysis_date')}:</Text>
                     <Text style={styles.txt3}>{date}</Text>
                   </View>
                   <View style={styles.miccontianer}>
                     <Image source={require('../assets2/images/r5.png')} />
                     <Text style={styles.txt2}>{t('result.description')}:</Text>
                     <Text style={styles.txt3}>
                        {description}
                     </Text>
                   </View>
                   
                   {fileUrl && (
                     <TouchableOpacity onPress={handleDownload} activeOpacity={0.8}>
                       <ImageBackground 
                         source={require('../assets2/images/backg.png')}
                         style={styles.background}
                         imageStyle={{width:319, height:61}}
                         resizeMode='cover'
                       >
                         <View style={styles.overlay}>
                           <Image source={require('../assets2/images/download.png')} />
                           <Text style={styles.txt4}>{t('common.download')}</Text>
                         </View>
                       </ImageBackground>
                     </TouchableOpacity>
                   )}
    </CollapsibleCard>
  )
}

export default Result

const styles = StyleSheet.create({
  container: {
    direction: 'rtl',
    width: '100%',
    height: '100%',
    gap: 10
  },
  miccontianer: {
    flexDirection: 'row',
    columnGap: 5,
    margin: 10
  },
  txt1: {
    fontWeight: '900',
    fontSize: 16,
    color: "#014CC4"
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
    color: '#FFFFFF'
  },
  background: {
    width: '100%',
    height: 61,
    marginTop: 10
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
  ele:{
    position:'absolute',
    bottom:"10%",
    left:'10%'
  }
});