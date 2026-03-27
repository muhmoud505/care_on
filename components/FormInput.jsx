// FormInput.jsx - Improved Picker Positioning + RTL

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Images from '../constants2/images';
import { Icons } from "./Icons";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const isTablet = SCREEN_WIDTH >= 768;
export const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
export const hp = (percentage) => (percentage / 100) * Dimensions.get('window').height;

const FormField = ({
  title,
  value,
  placeholder,
  onChangeText,
  otherStyles,
  required,
  type,
  error,
  secureTextEntry,
  onToggleSecureEntry,
  pickerItems,
  addOthers = false,
  addLabel,
  addModalTitle,
  addArabicLabel,
  addEnglishLabel,
  onAddConfirm,
  ...props
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [showPicker, setShowPicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArabic, setNewArabic] = useState('');
  const [newEnglish, setNewEnglish] = useState('');

  const selectedLabel = type === 'picker'
    ? pickerItems?.find(item => item.value === value)?.label || placeholder
    : value;

  const handleAddConfirm = () => {
    if (!newArabic.trim()) return;
    onAddConfirm?.(newArabic.trim(), newEnglish.trim(), '');
    setNewArabic(''); 
    setNewEnglish('');
    setShowAddModal(false);
  };

  const handleAddCancel = () => {
    setNewArabic(''); 
    setNewEnglish('');
    setShowAddModal(false);
  };

  return (
    <View style={[styles.container, otherStyles]}>
      {/* Title */}
      <Text style={[
        styles.title,
        { 
          textAlign: isRTL ? 'right' : 'left',
          alignSelf: isRTL ? 'flex-end' : 'flex-start'
        }
      ]}>
        {title}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Input Field */}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
          error && styles.errorInput,
        ]}
        onPress={() => type === 'picker' && setShowPicker(!showPicker)}
        activeOpacity={0.8}
      >
        {type === 'picker' ? (
          <Text style={[styles.input, { textAlign: isRTL ? 'right' : 'left', flex: 1 }]}>
            {selectedLabel}
          </Text>
        ) : (
          <TextInput
            style={[
              styles.input,
              { 
                textAlign: isRTL ? 'right' : 'left',
                writingDirection: isRTL ? 'rtl' : 'ltr',
                flex: 1,
              }
            ]}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7B7B8B"
            onChangeText={onChangeText}
            secureTextEntry={type === "password" && secureTextEntry}
            multiline={type === 'long'}
            {...props}
          />
        )}

        {type === 'picker' && <Icons.Arrd width={wp(6)} height={wp(6)} stroke="#ff0000" />}
        {type === "password" && (
          <TouchableOpacity onPress={onToggleSecureEntry} style={styles.icon}>
            <Icons.Eye width={wp(5)} height={wp(5)} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Picker Dropdown - Better Positioning */}
      {type === 'picker' && showPicker && (
        <View style={styles.pickerDropdown}>
          <FlatList
            data={pickerItems}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                onPress={() => {
                  onChangeText(item.value);
                  setShowPicker(false);
                }}
              >
                <Text style={[styles.listItemText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {item.label}
                </Text>
                {item.value === value && <Icons.Verify width={wp(5)} height={wp(5)} color="#014CC4" />}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => String(item.value)}
            style={styles.pickerList}
          />

          {addOthers && (
            <TouchableOpacity
              style={[styles.pickerItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={() => {
                setShowPicker(false);
                setShowAddModal(true);
              }}
            >
              <Image source={Images.add} style={styles.addIcon} />
              <Text style={[styles.addLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {addLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {error && (
        <Text style={[styles.errorText, { textAlign: isRTL ? 'right' : 'left' }]}>
          {error}
        </Text>
      )}

      {/* Add New Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={handleAddCancel}
      >
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={handleAddCancel}>
          <TouchableOpacity style={modalStyles.card} activeOpacity={1}>
            {/* Your add modal content */}
            <Text style={modalStyles.modalTitle}>
              {addModalTitle || addLabel || 'إضافة جديد'}
            </Text>
            {/* ... rest of your add modal ... */}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ====================== STYLES ======================
const styles = StyleSheet.create({
  container: {
    marginVertical: hp(2),
    marginTop: hp(0.6),
    gap: hp(1.5),
    marginHorizontal: wp(2.5),
    position: 'relative',           // Important for absolute positioning
  },
  title: {
    fontSize: Math.min(wp(3.5), 14),
    color: '#000',
    fontWeight: '800',
    width: '100%',
    marginBottom: hp(0.8),
  },
  required: { color: 'red' },

  inputContainer: {
    width: '100%',
    minHeight: hp(7),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.55)',
    justifyContent: 'center',
    alignItems:'center'
  },
  input: {
    flex: 1,
    color: '#000',
    fontWeight: '600',
    fontSize: Math.min(wp(4), 16),
  },
  icon: {
    width: wp(6),
    height: wp(6),
  },

  // Improved Picker Dropdown
  pickerDropdown: {
    position: 'absolute',
    top: hp(7.5),
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: '#014CC4',
    zIndex: 999,
    maxHeight: hp(40),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  pickerList: {
    maxHeight: hp(35),
  },
  pickerItem: {
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontSize: 15,
    color: '#333',
  },
  addLabel: {
    fontSize: 14,
    color: '#014CC4',
    fontWeight: 'bold',
  },
  addIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(2),
  },
  errorText: {
    color: 'red',
    fontSize: Math.min(wp(3), 12),
    marginTop: hp(0.5),
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp(4),
    padding: wp(5),
    width: '100%',
    gap: hp(1.5),
  },
  modalTitle: {
    fontSize: Math.min(wp(4.5), 18),
    fontWeight: '800',
    textAlign: 'center',
  },
  label: {
    fontSize: Math.min(wp(3.5), 14),
    fontWeight: '700',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.45)',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    height: hp(6),
  },
  btnRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginTop: hp(2),
  },
  btn: {
    flex: 1,
    height: hp(6),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: { backgroundColor: '#F8444F' },
  confirmBtn: { backgroundColor: '#80D280' },
  btnTxt: {
    color: '#fff',
    fontWeight: '700',
    fontSize: Math.min(wp(4), 16),
  },
});

export default FormField;