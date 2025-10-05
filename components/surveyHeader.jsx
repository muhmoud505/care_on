import { Image, StyleSheet, View } from 'react-native'

const SurveyHeader=()=>{
  return(
    <View style={styles.headerContainer}>
                <Image
                  source={require('../../../assets2/images/menu.png')}
                />
                <View style={styles.survey}>
                <Image
                  source={require('../../../assets2/images/notification.png')}
                  />
                <Image
                  style={styles.img}
                  source={require('../../../assets2/images/p.png')}
                  />
                  
                </View>
                
              </View>
  )
}
const styles = StyleSheet.create({
  container:{
    backgroundColor:'#fff'
  },
  headerContainer: {
    flexDirection:'row-reverse',
    height: 100, // Set your desired header height
    backgroundColor: '#fff', // Header background color
    paddingTop: 40, // For status bar spacing
  
    paddingHorizontal:20
   
  },
  txt1: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  img: {
    width: 40,
    height: 40,
    top:-8
  },
  survey:{
    flexDirection:'row-reverse',
    gap:20
  }
});