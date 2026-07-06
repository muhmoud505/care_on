import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCollapsible } from '../hooks/useCollapsible';
import useRTL from '../hooks/useRTL';
import { wp } from '../utils/responsive';
import { Icons } from './Icons';

const CollapsibleCard = ({
  title,
  isExpanded: controlledExpanded,
  onToggle,
  TYPE,
  icon,
  children,
  showType = false,
}) => {
  const { isExpanded, toggle } = useCollapsible(controlledExpanded, onToggle);
  const { rowDirection } = useRTL();

  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.8} onPress={toggle}>
        {/* Header - always visible */}
        <View style={[styles.mincontainer, { flexDirection: rowDirection }]}>
          {icon && <Icons.Medicine width={wp(6)} height={wp(6)} />}
          <Text style={styles.txt1}>{title}</Text>
          {showType && (
            <View style={styles.TYPE}>
              <Text style={{ color: '#FFF' }}>{TYPE}</Text>
            </View>
          )}
          <Icons.Expand
            width={wp(6)}
            height={wp(6)}
            style={!isExpanded ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        </View>

        {/* Collapsible content */}
        {isExpanded && children}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#FFF',
    padding: 10,
    marginVertical: 8,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    // Android shadow
    elevation: 4,
  },
  mincontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  txt1: {
    fontWeight: '900',
    fontSize: 16,
    color: '#014CC4',
  },
  TYPE: {
    backgroundColor: '#014CC4',
    padding: 5,
    borderRadius: 5,
    minWidth: 50,
    maxWidth: 80,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CollapsibleCard;