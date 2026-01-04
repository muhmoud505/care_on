import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking, Modal, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Images from '../constants2/images';
import { hp, wp } from '../utils/responsive';

 const PopUp = ({
  expanded: propExpanded, 
  onExpandedChange,
  onLocationGranted, 
 }) => {
    const [localExpanded, setLocalExpanded] = useState(propExpanded || false);
    const { t } = useTranslation();
  
    const handleClose = () => {
        setLocalExpanded(false);
        if (onExpandedChange) {
          onExpandedChange(false);
        }
    };

    const requestLocationPermissionIOS = async () => {
      const status = await Geolocation.requestAuthorization('whenInUse');
      if (status === 'granted') {
        return true;
      }
      if (status === 'denied') {
        Alert.alert(
          t('permissions.location_denied_title', { defaultValue: 'Location Permission Denied' }),
          t('permissions.location_denied_message'),
          [{ text: t('common.ok') }, { text: t('permissions.open_settings'), onPress: Linking.openSettings }]
        );
      }
      return false;
    };

    const requestLocationPermissionAndroid = async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: t('permissions.location_title', { defaultValue: "Location Permission" }),
          message: t('permissions.location_message', { defaultValue: "App needs access to your location" }),
          buttonNeutral: t('common.ask_me_later', { defaultValue: "Ask Me Later" }),
          buttonNegative: t('common.cancel', { defaultValue: "Cancel" }),
          buttonPositive: t('common.ok', { defaultValue: "OK" }),
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    };

    const getLocation = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Location fetched:', position.coords);
          if (onLocationGranted) {
            onLocationGranted(position.coords);
          }
          handleClose(); // Close popup on success
        },
        (error) => {
          console.log(error.code, error.message); 
          Alert.alert(t('errors.location_fetch_error_title', { defaultValue: 'Location Error' }), t('errors.location_fetch_error_message', { defaultValue: 'Could not fetch location.' }));
          handleClose();
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    const handleAllow = async () => {
      console.log("Requesting location permission...");
      let hasPermission = false;
      try {
        if (Platform.OS === 'ios') {
          hasPermission = await requestLocationPermissionIOS();
        } else if (Platform.OS === 'android') {
          hasPermission = await requestLocationPermissionAndroid();
        }

        if (hasPermission) {
          console.log("Location permission granted");
          getLocation();
        } else {
          console.log("Location permission denied");
          handleClose();
        }
      } catch (err) {
        console.warn(err);
        handleClose();
      }
    };

  return (
        <Modal
         visible={localExpanded}
        transparent={false}
        animationType="slide"
        >
         <View style={styles.modalContainer}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Image source={Images.close} />
            </TouchableOpacity>
            <View style={styles.modalContent}>
                <Image source={Images.location} style={styles.icon} />
                <Text style={styles.title}>{t('permissions.location_access_title')}</Text>
                <Text style={styles.description}> 
                  {t('permissions.location_access_description')}
                </Text> 
                <View style={styles.btnContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleAllow}>
                        <Text style={styles.btnText}>{t('common.allow')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.denyButton]} onPress={handleClose}>
                        <Text style={styles.btnText}>{t('common.dont_allow', { defaultValue: 'عدم السماح' })}</Text>
                    </TouchableOpacity>
                </View>
            </View>
         </View>
      
        </Modal>
  )
}

export default PopUp;

const styles = StyleSheet.create({
     modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: hp(6),
    right: wp(5),
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: wp(6),
    width: '90%',
    maxWidth: 400,
    alignItems:'center',
    gap: hp(2),
  },
  icon: {
    width: wp(15),
    height: wp(15),
    tintColor: '#014CC4',
  },
  title:{
   fontWeight: '700',
   fontSize: hp(2.5),
   color: '#000',
  },
  description: {
    fontSize: hp(1.8),
    textAlign: 'center',
    color: '#666',
    lineHeight: hp(2.5),
  },
  btnContainer:{
    flexDirection:'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: hp(2),
  },
  button:{
    backgroundColor:"#80D280",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: 12,
    alignItems:'center',
    justifyContent:'center',
  },
  denyButton: {
    backgroundColor: '#F8444F',
  },
  btnText:{
    fontSize: hp(2),
    fontWeight: '700',
    color:'#FFFFFF',
  },
})