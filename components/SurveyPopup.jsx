import { useTranslation } from 'react-i18next';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Images from '../constants2/images';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const SurveyPopup = ({ visible, onSkip, onTakeSurvey }) => {
  const { t } = useTranslation();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Image source={Images.survey} style={styles.modalIcon}/>
          <Text style={styles.modalDescription}>
            {t('survey.popup_description')}
          </Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={[styles.modalButton, styles.skipButton]} onPress={onSkip}>
              <Text style={styles.modalButtonText}>{t('common.skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.surveyButton]} onPress={onTakeSurvey}>
              <Text style={styles.modalButtonText}>{t('survey.take_survey')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SurveyPopup;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp(6),
    width: '100%',
    alignItems: 'center',
    gap: hp(2),
  },
  modalTitle: {
    fontSize: hp(2.8),
    fontWeight: '700',
    color: '#000',
  },
  modalDescription: {
    fontSize: hp(2),
    textAlign: 'center',
    color: '#666',
    lineHeight: hp(3),
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: hp(2),
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: wp(2),
  },
  skipButton: {
    backgroundColor: '#F8444F',
  },
  surveyButton: {
    backgroundColor: '#80D280',
  },
  modalButtonText: {
    fontSize: hp(2),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});