import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import Images from '../constants2/images';
import { useCollapsible } from '../hooks/useCollapsible';

const CollapsibleCard = ({
  title,
  isExpanded: controlledExpanded,
  onToggle,
  TYPE,
  icon,
  children,
}) => {
  const { isExpanded, toggle } = useCollapsible(controlledExpanded, onToggle);
 
  

  return (
    <Shadow
      distance={4}
      startColor="#00000010"
      offset={[-5, 2]}
      radius={12}
      style={{ width: '100%' }}
      paintInside={false}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={toggle}>
        <View style={styles.smcontainer}>
          {/* Header - always visible */}
          <View style={styles.mincontainer}>
            {icon && <Image source={icon} />}
            <Text style={styles.txt1}>{title}</Text>
            <View style={styles.TYPE}>
              <Text style={{color:"#FFF"}}>{TYPE}</Text>
            </View>
            <Image
              source={isExpanded ? Images.reportStep1 : Images.reportStep2_2}
            />
          </View>

          {/* Collapsible content */}
          {isExpanded && children}
        </View>
      </TouchableOpacity>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  smcontainer: {
    width: '100%', // Take the full width provided by the Shadow container
    borderRadius: 12,
    backgroundColor: '#FFF',
    padding: 10,
    overflow: 'hidden',
  },
  mincontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  txt1: {
    fontWeight: '900',
    fontSize: 16,
    color: '#014CC4',
  },
  TYPE:{
    backgroundColor:'#014CC4',
    padding:5,
    borderRadius:5,
    width:50,
    height:30,
    justifyContent:"center",
    alignItems:"center",
    color:"#fff",
    fontSize:12,
    fontWeight:"bold"
  }
});

export default CollapsibleCard;