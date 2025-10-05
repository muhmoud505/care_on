import { StyleSheet, View } from 'react-native';

const DashedBorder = ({ children, style }) => {
  return (
    <View style={[styles.dashedContainer, style]}>
      <View style={styles.dashedBorder} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dashedContainer: {
    position: 'relative',
  },
  dashedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#80D280',
    borderRadius: 12, // match your rounded-xl
  },
  content: {
    margin: 1, // to account for border width
    borderRadius: 11, // slightly less than container
    
  }
});

// Usage:
export default DashedBorder;