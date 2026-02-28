import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Images from '../constants2/images';
import DatePick from "./datePicker";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

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
  secureTextEntry, // Receive the secureTextEntry prop from parent
  onToggleSecureEntry, // Receive the toggle function from parent
  pickerItems,
  ...props
}) => {
  // Removed internal state to rely on parent props
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [show, setShow] = useState(false);
  const [showList,setShowList]=useState(false)

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || value; // Use value prop for date
    setShow(false);
    onChangeText(currentDate); // Pass date back to parent
  };

  // Find the label for the current value to display in the TextInput
  const selectedLabel = type === 'picker' ? (pickerItems?.find(item => item.value === value)?.label || placeholder) : value;

  return (
    <View 
      style={[styles.container, { direction:i18n.dir()}, otherStyles]}
    >
      <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
        {title}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={[
        styles.inputContainer,
        { flexDirection: isRTL ? 'row' : 'row-reverse',direction:'rtl' },
        error && styles.errorInput // Added error styling
        ,type=='long'&&styles.textArea
      ]}>
        {
          type=='search'&&(
            <Image
              style={{
                marginHorizontal:5
              }}
              source={Images.lens}
              />
          )
        }
        {type === 'picker' ? (
          <TouchableOpacity style={[styles.pickerTouchable, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} onPress={() => setShowList(!showList)}>
            <Text style={[styles.input, styles.pickerInput, { textAlign: isRTL ? 'left' : 'right' }]}>{selectedLabel}</Text>
            <Image source={Images.arrD} style={styles.icon} resizeMode="contain" />
          </TouchableOpacity>
        ) : (
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
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
          <TouchableOpacity onPress={onToggleSecureEntry}>
            <Image
              source={secureTextEntry ? Images.eye : Images.eyeHide}
              style={styles.icon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        {type === "date" && (
          <TouchableOpacity onPress={() => setShow(true)}>
            <Image
              source={Images.arrD}
              style={styles.icon}
              resizeMode="contain"
            />
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
        {type=='drop'&&(
          <TouchableOpacity
           onPress={()=>setShowList(!showList)}
          >
            <Image source={Images.arrD}/>
          </TouchableOpacity>

        )
        
        }
      </View>
      
      {/* Error message display */}
      {error && (
        <Text style={[styles.errorText, { textAlign: isRTL ? 'right' : 'left' }]}>
          {error}
        </Text>
      )}
      {/* data={generateDays()}
          renderItem={renderDayItem}
          keyExtractor={(item, index) => `${item.day}-${index}`}
          numColumns={7}
          scrollEnabled={false}
          contentContainerStyle={styles.daysGrid} */}

      {showList && (type === 'drop' || type === 'picker') && (
        <View style={styles.list}>
          <View style={[styles.listHeader, { flexDirection: isRTL ? 'row' : 'row' }]}>
            <TouchableOpacity style={{justifyContent:'center',alignItems:'center'}} onPress={() => setShowList(false)}>
              <Text style={[styles.closeButtonText,{textAlign:'center'}]}>{t('common.close', { defaultValue: 'Close' })}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            nestedScrollEnabled={true}
            scrollEnabled={true}
            data={type === 'picker' ? pickerItems : data}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.itemStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                onPress={() => {
                  onChangeText(type === 'picker' ? item.value : item);
                  // The list will no longer close on selection.
                }}
              >
                <Text style={[styles.listItemText, { textAlign: isRTL ? 'right' : 'left' }]}>{type === 'picker' ? item.label : item}</Text>
                {
                  (type === 'picker' ? item.value === value : item === value)
                    ? <Image source={Images.verify} /> : <Image source={Images.nonVerify} />
                }
              </TouchableOpacity>
            )

            }
            showsVerticalScrollIndicator={false}
            style={styles.flatListStyle}
            contentContainerStyle={styles.daysGrid}
            keyExtractor={(item) => (type === 'picker' ? item.value : String(item))}

          />
        </View>

      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp(2),
    marginTop: hp(0.6),
    gap: hp(1.5),
    marginHorizontal: wp(2.5)
  },
  title: {
    fontSize: Math.min(wp(3.5), 14),
    color: '#000',
    fontWeight: '800',
  },
  required: {
    color: 'red',
  },
  textArea:{
    height: hp(12),
    
  },
  inputContainer: {
    width: wp(85),
    position: 'relative',
    height: hp(7),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.55)',
 
    
  justifyContent: 'flex-start',
  
  },
  errorInput: { // Added error input style
    borderColor: 'red',
  },
  input: {
  
  flex: 1, // <--- Add this to fill the container width
  color: '#000',
  fontWeight: '600',
  fontSize: Math.min(wp(4), 16),
  paddingVertical: 0, 
  // For Arabic, ensure this is explicitly set
  writingDirection: 'rtl', 
  },
  icon: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12}], // Center the icon vertically
    width: wp(6),
    height: wp(6),
  },
  errorText: { // Added error text style
    color: 'red',
    fontSize: Math.min(wp(3), 12),
    marginTop: hp(0.5),
  },
  pickerInput: {
    color: '#000', // Ensure selected value is visible
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
  list:{
    width: wp(80),
    maxHeight: hp(30), // Use maxHeight to be more flexible
    alignSelf:'center',
    borderRadius: wp(4),
    borderColor:'#014CC4',
    borderWidth:1,
    backgroundColor: '#FFF',
    padding: wp(2.5),
    position:'absolute',
    top: hp(10), // Position below the input field
    zIndex: 1000,
    elevation: 5, // for Android shadow
  },
  listHeader: {
    paddingBottom: hp(1),
    marginBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#014CC4',
    fontWeight: 'bold',
  },

  daysGrid: {
    justifyContent: 'center',
    alignItems:'center',
    rowGap: hp(1.2)
  },
  itemStyle:{
    width: wp(75),
    height: hp(4),
    justifyContent:'space-between',
    alignItems:'center',
  }
});

export default FormField;