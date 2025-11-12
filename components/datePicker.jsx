import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Calendar from "./Test";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;


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
    // Format date as DD/MM/YYYY
    const dateObj = new Date(dateString);
    const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    
    onDateSelect && onDateSelect(formattedDate);
    //  console.log('date from datePicker: ',dateString);
     
    setShowModal(false);
  };

  return (
    <View style={[styles.container, otherStyles]}>
      {/* Title with dynamic text alignment */}
      <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
        {title}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity 
        style={styles.inputContainer}
        onPress={() => setShowModal(true)}
      >
        {/* Input text with dynamic text alignment */}
        <Text style={[styles.inputText, value ? styles.selectedDate : styles.placeholder, { textAlign: isRTL ? 'right' : 'left' }]}>
          {value || placeholder}
        </Text>

        <Image
          source={require('../assets2/images/c2.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar onDataSelect={handleDateSelect}/>
            
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
    width: wp(85),
    height: hp(10.5)
  },
  title: {
    fontSize: Math.min(wp(3.5), 14),
    fontWeight: '800',
    color: '#000',
  },
  required: {
    color: '#FF0000',
  },
  inputContainer: {
    flexDirection: 'row', // Let the parent View handle direction
    alignItems: 'center', // Keep items vertically centered
    justifyContent: 'space-between',
    width: '100%',
    height: hp(7),
    marginVertical: hp(2),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: '#8080808C',
  },
  inputText: {
    fontSize: Math.min(wp(3.5), 14),
    flex: 1, // Allow text to take up available space
    fontWeight: '700',
    color: '#7B7B8B',
    marginHorizontal: wp(4),
  },
  selectedDate: {
    color: '#000',
  },
  placeholder: {
    color: '#8080808C',
  },
  icon: {
    width: wp(6),
    height: wp(6),
    marginHorizontal: wp(2.5),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
     backgroundColor: 'rgba(0,0,0,0)',
    borderRadius: 16,
    padding: wp(5),
    width: wp(90),
    maxWidth: wp(100),
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