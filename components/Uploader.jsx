import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Images from '../constants2/images';
import DashedBorder from './dashed';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const Uploader = ({ title, required, error, style,onFileSelect }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { t } = useTranslation();
  const [imageName, setImageName] = useState(t('uploader.upload'));

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('User cancelled picker');
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No assets in picker result');
      }

      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      if (!fileInfo.exists) {
        throw new Error('File does not exist at URI');
      }

      setSelectedImage(asset.uri);
      const fileName = asset.name || asset.uri.split('/').pop();
      setImageName(fileName.length > 15 
        ? `${fileName.substring(0, 12)}...` 
        : fileName);

      // Pass complete file info to parent
      if (onFileSelect) {
        onFileSelect({
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType,
          size: asset.size
        });
      }

    } catch (err) {
      console.error('Error in pickImage:', err);
      Alert.alert(t('common.error'), t('uploader.pick_failed'));
      setImageName(t('uploader.upload'));
      if (onFileSelect) onFileSelect(null);
    } 
  };

  return (
    <View style={[styles.v1, style]}>
      <Text style={[{ direction: 'rtl' }, styles.txt1]}>
        {title}{required ? <Text style={{ color: 'red', fontWeight: '600' }}> *</Text> : null}
      </Text>
      <DashedBorder>
        <TouchableOpacity
          activeOpacity={0.3}
          style={styles.btn1}
          onPress={pickImage}
        >
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="cover"
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)} // Debug 7
              />
              <Text style={styles.imageNameText}>{imageName}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.txt1}>{imageName}</Text>
              <Image source={Images.upload} />
            </>
          )}
        </TouchableOpacity>
      </DashedBorder>
        {error && (
              <Text style={styles.errorText}>
                {error}
              </Text>
            )}
    </View>
  );
};

const styles = StyleSheet.create({
  v1: {
    width: wp(85),
    height: hp(12),
    marginHorizontal: wp(5),
    marginVertical: hp(0.6),
    justifyContent: 'space-between',
  },
  txt1: {
    fontSize: Math.min(wp(3.5), 14),
    color: 'black',
    fontWeight: 'bold',
  },
  btn1: {
    width: wp(85),
    height: hp(7.5),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#014CC440',
    borderRadius: wp(3),
    columnGap: wp(1.2),
    overflow: 'hidden',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: wp(2.5),
  },
  previewImage: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(1.2),
    marginRight: wp(2.5),
    backgroundColor: '#f0f0f0', // Helps visualize the image area
  },
  imageNameText: {
    fontSize: Math.min(wp(3.5), 14),
    color: 'black',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
   errorText: { // Added error text style
    color: 'red',
    fontSize: Math.min(wp(3), 12),
    marginTop: hp(0.5),
    textAlign: 'right',
  },
  errorInput: { // Added error input style
    borderColor: 'red',
  },
});

export default Uploader;