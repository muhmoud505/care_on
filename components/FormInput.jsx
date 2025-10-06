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
  ...props
}) => {
  // Removed internal state to rely on parent props
  const { i18n } = useTranslation();
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [showList,setShowList]=useState(false)

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };

  return (
    <View 
      style={[styles.container, { direction:'rtl'}, otherStyles]}
    >
      <Text style={[styles.title, {textAlign: 'left'}]}>
        {title}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={[
        styles.inputContainer,
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
        <TextInput
          style={[styles.input]}
          value={value}
          numberOfLines={type === 'long' ? 5 : 1}
          editable={type !== 'drop'}
          multiline={type === 'long'}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={onChangeText}

          onBlur={onBlur}
          secureTextEntry={type === "password" && secureTextEntry} // Use the prop from parent
          {...props}
        />
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
            value={date}
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
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      {/* data={generateDays()}
          renderItem={renderDayItem}
          keyExtractor={(item, index) => `${item.day}-${index}`}
          numColumns={7}
          scrollEnabled={false}
          contentContainerStyle={styles.daysGrid} */}

      {showList&&(
        <FlatList
         nestedScrollEnabled={true}
         scrollEnabled={true}
          data={data}
          renderItem={({item})=>(
            <TouchableOpacity
             style={styles.itemStyle}
             onPress={() => {
              onChangeText(item);
              setShowList(false);
            }}
            >
              <Text style={styles.listItemText}>{item}</Text>
            </TouchableOpacity>
          )
            
          }
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={styles.daysGrid}
           keyExtractor={(item, index) => `${index}`}
         
        />

       

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
    height: hp(7),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.55)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorInput: { // Added error input style
    borderColor: 'red',
  },
  input: {
    flex: 1,
    color: '#000',
    fontWeight: '600',
    fontSize: Math.min(wp(4), 16),
    textAlign: 'right',
  },
  icon: {
    width: wp(6),
    height: wp(6),
  },
  errorText: { // Added error text style
    color: 'red',
    fontSize: Math.min(wp(3), 12),
    marginTop: hp(0.5),
    textAlign: 'right',
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
  },
  list:{
    width: wp(80),
    height: hp(25),
    alignSelf:'center',
    borderRadius: wp(4),
    borderColor:'#DDD',
    borderWidth:1,
    backgroundColor: '#FFF',
    padding: wp(2.5),
    position:'absolute',
    top: hp(12), // Position below the input field
    zIndex: 1000,
    elevation: 5, // for Android shadow
  },
  daysGrid: {
    justifyContent: 'center',
    alignItems:'center',
    rowGap: hp(1.2)
  },
  itemStyle:{
    width: wp(75),
    height: hp(4),
    justifyContent:'center',
    alignItems:'center'
    
  }
});

export default FormField;