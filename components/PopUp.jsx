import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, LayoutAnimation, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Images from '../constants2/images';

 const PopUp = ({
  expanded: propExpanded, 
  onExpandedChange, 
 }) => {
    const [localExpanded, setLocalExpanded] = useState(propExpanded || false);
    const { t } = useTranslation();
  
    const toggleExpand = () => {
        const newExpanded = !localExpanded;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setLocalExpanded(newExpanded);
        
        // Notify parent about state change
        if (onExpandedChange) {
          onExpandedChange(newExpanded);
        }
      };
  return (
        
        
        <Modal
       
         visible={localExpanded}
        transparent={false}
        
        >
         <View style={styles.modalContainer}>
            <TouchableOpacity
             onPress={toggleExpand}
            >
              <Image source={Images.close} />
            </TouchableOpacity>
            <View style={styles.modalContent}>
                <Image source={Images.survey} />
                <Text style={styles.txt}>{t('survey.quick_prompt', { defaultValue: ' يرجي عمل استبيان سريع' })}</Text>
                <View style={styles.btnContainer}>
                    <TouchableOpacity>
                        <View style={styles.btn}>
                            <Text style={styles.btnText}>{t('common.lets_go', { defaultValue: 'هيا بنا !' })}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View style={[styles.btn,{backgroundColor:'#F8444F'}]}>
                            <Text style={styles.btnText}>{t('common.later', { defaultValue: 'لاحقا !' })}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
         </View>
      
        </Modal>
        

   
  )
}

export default PopUp;

const styles = StyleSheet.create({
     modalContainer: {
    flex: 1,
    paddingTop:10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap:20,
   
    
    
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: '90%',
    height:'60%',
    maxWidth: 400,
    justifyContent:'space-around',
    alignItems:'center'

  },
  txt:{
   fontWeight:700,
   fontSize:16
  },
  btnContainer:{
    flexDirection:'row',
    columnGap:'19'
  },
  btn:{
    backgroundColor:"#80D280",
    width:85,
    height:36,
    borderRadius:8,
    alignItems:'center',
    justifyContent:'center' 
  },
  btnText:{
    fontSize:16,
    fontWeight:700,
    color:'#FFFFFF'

  },
  
})