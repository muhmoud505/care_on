import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Images from '../constants2/images';

 const ModalPopup = ({
  visible,
  onClose,
  children,
 }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Image source={Images.close} />
        </TouchableOpacity>
        <View style={styles.modalContent}>
          {children}
        </View>
      </View>
    </Modal>
  )
}

export default ModalPopup;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 20,
  },
});