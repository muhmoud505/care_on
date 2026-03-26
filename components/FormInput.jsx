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
    View
} from "react-native";
import Images from '../constants2/images';
import DatePick from "./datePicker";
import { Icons } from "./Icons";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 1. Detect if it's a tablet (common threshold is 600-768 logical pixels)
export const isTablet = SCREEN_WIDTH >= 768;

// 2. Responsive width with a "Max" cap for tablets
export const wp = (percentage) => {
  const value = (percentage / 100) * SCREEN_WIDTH;
  if (isTablet) {
    // On tablets, don't let the 85% width exceed a reasonable size (e.g., 500px)
    const maxValue = 550; 
    return value > maxValue ? maxValue : value;
  }
  return value;
};

export const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

const FormField = ({
  title,
  value,
  placeholder,
  onChangeText,
  otherStyles,
  required,
  type,
  error,
  onBlur,
  data,
  secureTextEntry,
  onToggleSecureEntry,
  pickerItems,
  addOthers = false,
  addLabel,
  addModalTitle,       // e.g. "اضافة اشعة جديدة"
  addArabicLabel,      // e.g. "اسم الاشعة بالعربية"
  addEnglishLabel,     // e.g. "اسم الاشعة الانجليزية"
  addDescLabel,        // e.g. "الوصف الطبي" — optional, omit to hide
  onAddConfirm,        // callback(arabicName, englishName, description) => void
  ...props
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [show, setShow] = useState(false);
  const [showList, setShowList] = useState(false);


  // Add-new modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArabic, setNewArabic] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || value;
    setShow(false);
    onChangeText(currentDate);
  };

  const selectedLabel = type === 'picker'
    ? (pickerItems?.find(item => item.value === value)?.label || placeholder)
    : value;

  const handleAddConfirm = () => {
    if (!newArabic.trim()) return;
    onAddConfirm?.(newArabic.trim(), newEnglish.trim(), newDesc.trim());
    setNewArabic('');
    setNewEnglish('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const handleAddCancel = () => {
    setNewArabic('');
    setNewEnglish('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <View style={[styles.container,  otherStyles,]}>
      <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
        {title}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={[
        styles.inputContainer,
        { flexDirection: isRTL ? 'row' : 'row-reverse', direction: isRTL ? 'rtl' : 'ltr' },
        error && styles.errorInput,
        type === 'long' && styles.textArea,
      ]}>
        {type === 'search' && (
          <Image style={{ marginHorizontal: 5 }} source={Images.lens} />
        )}

        {type === 'picker' ? (
          <View style={{ position: 'relative', flex: 1 }}>
            <TouchableOpacity
              style={[styles.pickerTouchable, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}
              onPress={() => setShowList(!showList)}
            >
              <Text style={[styles.input, styles.pickerInput, { textAlign: isRTL ? 'left' : 'right' }]}>
                {selectedLabel}
              </Text>
              <Icons.Arrd width={wp(6)} height={wp(6)}  stroke="#ff0000"  />
            </TouchableOpacity>

            {showList && (
              <View style={styles.list}>
                <FlatList
                  nestedScrollEnabled
                  scrollEnabled
                  data={pickerItems}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.itemStyle, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}
                      onPress={() => {
                        onChangeText(item.value);
                        setShowList(false);
                      }}
                    >
                      <Text style={[styles.listItemText, { textAlign: isRTL ? 'right' : 'left' }]}>
                        {item.label}
                      </Text>
                      {item.value === value
                        ? <Icons.Verify width={wp(5)} height={wp(5)} stroke="#581f1f"  color='#000' />
                        : <Icons.Verify width={wp(5)} height={wp(5)}  color='#581f1f' />
                      }
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.daysGrid}
                  keyExtractor={(item) => String(item.value)}
                />

                {addOthers && (
                  <TouchableOpacity
                    style={[styles.itemStyle, { marginHorizontal: wp(2.5), flexDirection: isRTL ? 'row' : 'row-reverse' }]}
                    onPress={() => {
                      setShowList(false);
                      setShowAddModal(true); // Open the add modal
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
          </View>
        ) : (
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}
            value={value}
            numberOfLines={type === 'long' ? 5 : 1}
            editable={type !== 'drop' && type !== 'date'}
            multiline={type === 'long'}
            placeholder={placeholder}
            placeholderTextColor="#7B7B8B"
            onChangeText={onChangeText}
            onBlur={onBlur}
            secureTextEntry={type === "password" && secureTextEntry}
            {...props}
          />
        )}

        {type === "password" && (
          <TouchableOpacity onPress={onToggleSecureEntry} style={styles.icon}>
            <Icons.Eye width={wp(5)} height={wp(5)}/>
          </TouchableOpacity>
        )}

        {type === "date" && (
          <TouchableOpacity onPress={() => setShow(true)}>
            <Image source={Images.arrD} style={styles.icon} resizeMode="contain" />
          </TouchableOpacity>
        )}

        {show && (
          <DatePick
            value={value || new Date()}
            mode="date"
            display="spinner"
            onChange={onChange}
          />
        )}

        {type === 'drop' && (
          <TouchableOpacity onPress={() => setShowList(!showList)}>
            <Image source={Images.arrD} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { textAlign: isRTL ? 'right' : 'left' }]}>
          {error}
        </Text>
      )}

      {/* ── Add New Item Modal ── */}
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
           <TouchableOpacity style={modalStyles.closeBtn} onPress={handleAddCancel}>
              <Text style={modalStyles.closeTxt}>✕</Text>
            </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            style={[modalStyles.card, { direction: isRTL ? 'ltr' : 'rtl' }]}
            onPress={() => {}}
          >
            {/* Close X */}
           

            {/* Modal title */}
            <Text style={modalStyles.modalTitle}>
              {addModalTitle || addLabel || 'اضافة جديد'}
            </Text>

            {/* Arabic name */}
            <Text style={[modalStyles.label,{textAlign:isRTL ? 'right' : 'left'}]}>
              {addArabicLabel || 'الاسم بالعربية'}
              <Text style={{ color: 'red' }}> *</Text>
            </Text>
            <TextInput
              style={modalStyles.input}
              placeholder={`ادخل ${addArabicLabel || 'الاسم بالعربية'}`}
              placeholderTextColor="#9CA3AF"
              value={newArabic}
              onChangeText={setNewArabic}
              textAlign={isRTL ? 'right' : 'left'}
            />

            {/* English name */}
             <Text style={[modalStyles.label,{textAlign:isRTL ? 'right' : 'left'}]}>
              {addEnglishLabel || 'الاسم بالانجليزية'}
            </Text>
            <TextInput
              style={modalStyles.input}
              placeholder={`ادخل ${addEnglishLabel || 'الاسم بالانجليزية'}`}
              placeholderTextColor="#9CA3AF"
              value={newEnglish}
              onChangeText={setNewEnglish}
              textAlign={isRTL ? 'right' : 'left'}
            />

            {/* Description — only shown when addDescLabel is provided */}
           

            {/* Hint text */}
            <Text style={modalStyles.hint}>
              {t('form.add_hint', {
                defaultValue: 'يمكنك ارسال الطلب مرة واحدة فقط لاضافة العنصر وذلك راجع للإدارة.'
              })}
            </Text>

            {/* Buttons */}
            <View style={modalStyles.btnRow}>
              <TouchableOpacity
                style={[modalStyles.btn, modalStyles.cancelBtn]}
                onPress={handleAddCancel}
              >
                <Text style={[modalStyles.btnTxt, { color: '#fff' }]}>
                  {t('common.cancel', { defaultValue: 'الغاء' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.btn, modalStyles.confirmBtn, !newArabic.trim() && { opacity: 0.5 }]}
                onPress={handleAddConfirm}
                disabled={!newArabic.trim()}
              >
                <Text style={[modalStyles.btnTxt, { color: '#fff' }]}>
                  {t('common.add', { defaultValue: 'اضافة' })}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp(4),
    padding: wp(5),
    width: '100%',
    gap: hp(1.2),
   
  },
  closeBtn: {
    position: 'absolute',
    top: wp(25),
    left: wp(45),
    width: 36,
    height: 36,
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeTxt: {
    fontSize: 13,
    color: '#fff',
  },
  modalTitle: {
    fontSize: Math.min(wp(4.5), 18),
    fontWeight: '800',
    color: '#1A1D44',
    textAlign: 'center',
    marginBottom: hp(0.5),
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
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  textArea: {
    height: hp(10),
    paddingTop: hp(1),
  },
  hint: {
    fontSize: Math.min(wp(3), 12),
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: hp(2.5),
  },
  btnRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginTop: hp(1),
  },
  btn: {
    flex: 1,
    height: hp(6),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#F8444F',
    backgroundColor: '#F8444F',
    color:'#fff'
  },
  confirmBtn: {
    backgroundColor: '#80D280',
  },
  btnTxt: {
    fontSize: Math.min(wp(4), 16),
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  container: {
    marginVertical: hp(2),
    marginTop: hp(0.6),
    gap: hp(1.5),
    marginHorizontal: wp(2.5),
  },
  title: {
    fontSize: Math.min(wp(3.5), 14),
    color: '#000',
    fontWeight: '800',
  },
  required: {
    color: 'red',
  },
  textArea: {
    height: hp(12),
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    height: hp(7),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.55)',
    justifyContent: 'flex-start',
  },
  errorInput: {
    borderColor: 'red',
  },
  input: {
    flex: 1,
    color: '#000',
    fontWeight: '600',
    fontSize: Math.min(wp(4), 16),
    paddingVertical: 0,
    // writingDirection is set inline (dynamic per language) — see TextInput above
  },
  icon: {
    position: 'absolute',
    right: wp(2),
    top: hp(1.5),
    width: wp(6),
    height: wp(6),
  },
  addIcon: {
    width: wp(5),
    height: wp(5),
  },
  errorText: {
    color: 'red',
    fontSize: Math.min(wp(3), 12),
    marginTop: hp(0.5),
  },
  pickerInput: {
    color: '#999',
    fontWeight: '600',
  },
  pickerTouchable: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
  },
  addLabel: {
    fontSize: 14,
    color: '#014CC4',
    fontWeight: 'bold',
  },
  list: {
    width: wp(85),
    maxHeight: hp(30),
    alignSelf: 'center',
    borderRadius: wp(5),
    borderColor: '#014CC4',
    borderWidth: 1,
    backgroundColor: '#FFF',
    padding: wp(2.5),
    position: 'absolute',
    top: hp(7),
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  daysGrid: {
    justifyContent: 'center',
    alignItems: 'center',
    rowGap: hp(1.2),
  },
  itemStyle: {
    width: wp(75),
    height: hp(4),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default FormField;