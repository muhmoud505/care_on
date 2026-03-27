// Uploader.jsx - Fixed RTL

import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hp, wp } from '../utils/responsive'; // Use your responsive utils
import DashedBorder from './dashed';
import { Icons } from './Icons';

const Uploader = ({ title, required, error, style, onFileSelect }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [imageName, setImageName] = useState(t('uploader.upload'));

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setSelectedImage(asset.uri);
      const fileName = asset.name || asset.uri.split('/').pop();
      setImageName(fileName.length > 15 ? `${fileName.substring(0, 12)}...` : fileName);

      if (onFileSelect) {
        onFileSelect({
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType,
          size: asset.size
        });
      }
    } catch (err) {
      Alert.alert(t('common.error'), t('uploader.pick_failed'));
      setImageName(t('uploader.upload'));
      if (onFileSelect) onFileSelect(null);
    }
  };

  return (
    <View style={[styles.v1, style]}>
      {/* Title - RTL Fixed */}
      <Text style={[
        styles.txt1, 
        { textAlign: isRTL ? 'right' : 'left' }
      ]}>
        {title}
        {required && <Text style={{ color: 'red', fontWeight: '600' }}> *</Text>}
      </Text>

      <DashedBorder>
        <TouchableOpacity
          activeOpacity={0.3}
          style={[styles.btn1, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          onPress={pickImage}
        >
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
              <Text style={[styles.imageNameText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {imageName}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.txt1}>{imageName}</Text>
              <Icons.Uploada width={wp(6)} height={wp(6)} />
            </>
          )}
        </TouchableOpacity>
      </DashedBorder>

      {error && (
        <Text style={[styles.errorText, { textAlign: isRTL ? 'right' : 'left' }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  v1: {
    marginVertical: hp(0.6),
    marginHorizontal: wp(2.5),
  },
  txt1: {
    fontSize: Math.min(wp(3.5), 14),
    color: 'black',
    fontWeight: 'bold',
    marginBottom: hp(0.8),
  },
  btn1: {
    width: '100%',
    height: hp(7.5),
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  imageNameText: {
    fontSize: Math.min(wp(3.5), 14),
    color: 'black',
    fontWeight: 'bold',
    flex: 1,
  },
  errorText: {
    color: 'red',
    fontSize: Math.min(wp(3), 12),
    marginTop: hp(0.5),
  },
});

export default Uploader;