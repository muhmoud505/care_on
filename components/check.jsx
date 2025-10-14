import Checkbox from 'expo-checkbox';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Check = ({ q, ans, required, value, onValueChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.txt}>
        {q}
        {required ? <Text style={{ color: '#ff0000' }}>*</Text> : null}
      </Text>
      <View style={styles.minCon}>
        {ans.map((answerOption) => (
          <TouchableOpacity
            key={answerOption}
            style={styles.micCont}
            onPress={() => onValueChange(answerOption)}
            activeOpacity={0.7}
          >
            <Checkbox
              value={value === answerOption}
              onValueChange={() => onValueChange(answerOption)}
              color={value === answerOption ? '#80D280' : undefined}
            />
            <Text>{answerOption}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export default Check

const styles = StyleSheet.create({
    container:{
        rowGap:20
    },
    minCon:{
        flexDirection:'row',
        columnGap:20
    },
    micCont:{
        flexDirection:'row',
        alignItems: 'center',
        columnGap:10,
    },
    txt:{
        fontWeight:'500',
        fontSize:14,
    }
})