import { Image, StyleSheet, Text, View } from 'react-native'

const HeaderBtn = ({text}) => {
  return (
    <View className='flex flex-col h-5'>

      <Text >{text}</Text>
      <Image className='w-[24px] h-[24px]' source={require('../assets/images/Vector.png')}/>
    </View>
  )
}

export default HeaderBtn

const styles = StyleSheet.create({})