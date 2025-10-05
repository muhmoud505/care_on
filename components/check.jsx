import Checkbox from 'expo-checkbox'
import { StyleSheet, Text, View } from 'react-native'

const Check = ({q,ans,required}) => {
  return (
    <View style={styles.container}>
          <Text style={styles.txt}>{q}{required?<Text style={{color:'#ff0000'}}>*</Text>:null}</Text>
          <View style={styles.minCon}>
            {
                ans.map((a)=>(
                    <View style={styles.micCont}>
                        <Checkbox/>
                        <Text>{a}</Text>
                    </View>
                ))
            }
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
        columnGap:10
    },
    txt:{
        fontWeight:'500',
        fontSize:14,
        
    }
})