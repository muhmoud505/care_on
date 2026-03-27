// DatePick.jsx - Fixed RTL Version

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Icons } from "./Icons";
import Calendar from "./Test";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
export const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const DatePick = ({
  title,
  value,
  placeholder,
  onDateSelect,
  otherStyles,
  required,
  ...props
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [showModal, setShowModal] = useState(false);

  const handleDateSelect = (dateString) => {
    const dateObj = new Date(dateString);
    const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    onDateSelect(formattedDate);
    setShowModal(false);
  };

  return (
    <View style={[styles.container, otherStyles]}>
      {/* Title - RTL Fixed */}
      <Text style={[
        styles.title,
        { textAlign: isRTL ? 'right' : 'left', alignSelf: isRTL ? 'flex-end' : 'flex-start' }
      ]}>
        {title}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Input Field */}
      <TouchableOpacity 
        style={[styles.inputContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        onPress={() => setShowModal(true)}
      >
        <Text style={[
          styles.inputText, 
          value ? styles.selectedDate : styles.placeholder,
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>
          {value || placeholder}
        </Text>

        <Icons.Calendarb width={wp(5)} height={wp(5)} style={styles.icon} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar onDataSelect={handleDateSelect} />
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            > 
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp(2),
    marginTop: hp(0.6),
    marginHorizontal: wp(2.5),
  },
  title: {
    fontSize: Math.min(wp(3.5), 14),
    fontWeight: '800',
    color: '#000',
    width: '100%',
    marginBottom: hp(0.8),
  },
  required: { color: 'red' },
  inputContainer: {
    width: '100%',
    height: hp(7),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: '#8080808C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    flex: 1,
    fontSize: Math.min(wp(3.5), 14),
    fontWeight: '700',
    marginHorizontal: wp(4),
  },
  selectedDate: { color: '#000' },
  placeholder: { color: '#8080808C' },
  icon: {
    width: wp(6),
    height: wp(6),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp(5),
    width: wp(90),
  },
  closeButton: {
    marginTop: hp(2),
    padding: wp(3),
    backgroundColor: '#014CC4',
    borderRadius: wp(2),
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Math.min(wp(4), 16),
  },
});

export default DatePick;