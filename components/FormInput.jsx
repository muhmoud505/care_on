// FormInput.jsx - Fixed: isRTL export, dropdown offset, multiSelect, errorInput, RTL addIcon

import i18n from "i18next"; // ✅ direct import for module-level usage
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

// ✅ Export as a FUNCTION so it's evaluated at call time, not at module load time.
// This prevents the Hermes "Property 'isRTL' doesn't exist" crash.
export const getIsRTL = () => i18n.dir() === 'rtl';

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
  multiSelect = false,
  ...props
}) => {
  const { t, i18n } = useTranslation();
  // ✅ Safe: evaluated inside the component, after i18n is initialized
  const isRTL = i18n.dir() === 'rtl';

  const [showPicker, setShowPicker] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArabic, setNewArabic] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [inputLayout, setInputLayout] = useState({ y: 0, height: 0 });

  const selectedLabel = type === 'picker'
    ? multiSelect
      ? Array.isArray(value) && value.length > 0
        ? value
            .map(v => pickerItems?.find(item => item.value === v)?.label)
            .filter(Boolean)
            .join(', ')
        : placeholder
      : pickerItems?.find(item => item.value === value)?.label || placeholder
    : placeholder;

  const handlePickerSelect = (itemValue) => {
    if (multiSelect) {
      const current = Array.isArray(value) ? value : [];
      const exists = current.includes(itemValue);
      const updated = exists
        ? current.filter(v => v !== itemValue)
        : [...current, itemValue];
      onChangeText(updated);
    } else {
      onChangeText(itemValue);
      setShowPicker(false);
    }
  };

  const isSelected = (itemValue) => {
    if (multiSelect) return Array.isArray(value) && value.includes(itemValue);
    return value === itemValue;
  };

  const handleAddConfirm = () => {
    if (!newArabic.trim() && !newEnglish.trim()) return;
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
          alignSelf: isRTL ? 'flex-end' : 'flex-start',
        },
      ]}>
        {title}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Input / Picker trigger */}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
          error ? styles.errorInput : null,
        ]}
        onPress={() => type === 'picker' && setShowPicker(prev => !prev)}
        activeOpacity={0.8}
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          setInputLayout({ y, height });
        }}
      >
        {type === 'picker' ? (
          <Text style={[
            styles.input,
            {
              textAlign: isRTL ? 'right' : 'left',
              flex: 1,
              color: selectedLabel === placeholder ? '#7B7B8B' : '#000',
            },
          ]}>
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
              },
            ]}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7B7B8B"
            onChangeText={onChangeText}
            secureTextEntry={type === 'password' && secureTextEntry}
            multiline={type === 'long'}
            {...props}
          />
        )}

        {type === 'picker' && (
          <Icons.Arrd
            width={wp(6)}
            height={wp(6)}
            stroke="#ff0000"
            style={{ transform: [{ rotate: showPicker ? '180deg' : '0deg' }] }}
          />
        )}

        {type === 'password' && (
          <TouchableOpacity onPress={onToggleSecureEntry} style={styles.icon}>
            <Icons.Eye width={wp(5)} height={wp(5)} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Picker Dropdown */}
      {type === 'picker' && showPicker && (
        <View style={[
          styles.pickerDropdown,
          { top: inputLayout.y + inputLayout.height + hp(0.5) },
        ]}>
          <FlatList
            data={pickerItems}
            keyExtractor={(item) => String(item.value)}
            style={styles.pickerList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  isSelected(item.value) && styles.pickerItemSelected,
                ]}
                onPress={() => handlePickerSelect(item.value)}
              >
                <Text style={[
                  styles.listItemText,
                  { textAlign: isRTL ? 'right' : 'left', flex: 1 },
                  isSelected(item.value) && styles.listItemTextSelected,
                ]}>
                  {item.label}
                </Text>
                {isSelected(item.value) && (
                  <Icons.Verify width={wp(5)} height={wp(5)} color="#014CC4" />
                )}
              </TouchableOpacity>
            )}
          />

          {addOthers && (
            <TouchableOpacity
              style={[
                styles.pickerItem,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
              onPress={() => {
                setShowPicker(false);
                setShowAddModal(true);
              }}
            >
              <Image
                source={Images.add}
                style={[
                  styles.addIcon,
                  isRTL ? { marginLeft: wp(2) } : { marginRight: wp(2) },
                ]}
              />
              <Text style={[styles.addLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {addLabel}
              </Text>
            </TouchableOpacity>
          )}

          {multiSelect && (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.doneButtonText}>{t('done') || 'Done'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Error message */}
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
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={handleAddCancel}
        >
          <TouchableOpacity style={modalStyles.card} activeOpacity={1}>
            <Text style={modalStyles.modalTitle}>
              {addModalTitle || addLabel || 'إضافة جديد'}
            </Text>

            {addArabicLabel && (
              <>
                <Text style={[modalStyles.label, { textAlign: 'right' }]}>
                  {addArabicLabel}
                </Text>
                <TextInput
                  style={[modalStyles.input, { textAlign: 'right', writingDirection: 'rtl' }]}
                  value={newArabic}
                  onChangeText={setNewArabic}
                  placeholder="اكتب هنا"
                  placeholderTextColor="#7B7B8B"
                />
              </>
            )}

            {addEnglishLabel && (
              <>
                <Text style={[modalStyles.label, { textAlign: 'left' }]}>
                  {addEnglishLabel}
                </Text>
                <TextInput
                  style={[modalStyles.input, { textAlign: 'left' }]}
                  value={newEnglish}
                  onChangeText={setNewEnglish}
                  placeholder="Type here"
                  placeholderTextColor="#7B7B8B"
                />
              </>
            )}

            <View style={modalStyles.btnRow}>
              <TouchableOpacity
                style={[modalStyles.btn, modalStyles.cancelBtn]}
                onPress={handleAddCancel}
              >
                <Text style={modalStyles.btnTxt}>{t('cancel') || 'إلغاء'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.btn, modalStyles.confirmBtn]}
                onPress={handleAddConfirm}
              >
                <Text style={modalStyles.btnTxt}>{t('confirm') || 'تأكيد'}</Text>
              </TouchableOpacity>
            </View>
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
    position: 'relative',
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
    alignItems: 'center',
  },
  errorInput: {
    borderColor: 'red',
    borderWidth: 1.5,
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
  pickerDropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: '#014CC4',
    zIndex: 999,
    elevation: 10,
    maxHeight: hp(40),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  pickerList: {
    maxHeight: hp(35),
  },
  pickerItem: {
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#EEF3FF',
  },
  listItemText: {
    fontSize: 15,
    color: '#333',
  },
  listItemTextSelected: {
    color: '#014CC4',
    fontWeight: '700',
  },
  addLabel: {
    fontSize: 14,
    color: '#014CC4',
    fontWeight: 'bold',
  },
  addIcon: {
    width: wp(5),
    height: wp(5),
  },
  doneButton: {
    paddingVertical: hp(1.5),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  doneButtonText: {
    color: '#014CC4',
    fontWeight: '700',
    fontSize: Math.min(wp(4), 16),
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
    marginBottom: hp(1),
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
    color: '#000',
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
