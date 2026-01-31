import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;
export const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

export const profileStyles = StyleSheet.create({
  info: {
    position: 'relative',
    bottom: hp(8),
    flexDirection: 'column',
    alignItems: 'center',
  },
  cont1: {
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: '#fff',
    width: '90%',
    height: hp(15),
    marginTop: hp(5),
    marginHorizontal: '5%',
    borderRadius: 12,
  },
  btn: {
    width: wp(30),
    height: hp(4.5),
    borderRadius: 8,
    backgroundColor: '#80D280',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: wp(5),
    top: hp(-0.6),
    zIndex: 1,

  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: wp(2.5),
    textAlign: 'center',
  },
  cont2: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: wp(5),
    marginTop: hp(2),
  },
  cont3: {
    direction: 'rtl',
    margin: wp(5),
  },
  profileImg: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    overflow: 'hidden',
  },
  ele1: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4.25),
    width: wp(8.5),
    height: wp(8.5),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: hp(7),
    right: wp(22),
  },
  ele2: {
    backgroundColor: '#014CC4',
    width: wp(12),
    height: wp(12),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    height: hp(8),
    marginTop: hp(1.5),
    direction: 'rtl',
  },
  overlay: {
    backgroundColor: '#00000080',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: wp(2.5),
    borderRadius: 12,
  },
  txt1: {
    fontSize: wp(3.5),
    fontWeight: '700',
  },
  txt2: {
    fontSize: wp(3.5),
    fontWeight: '500',
    color: '#999999',
  },
  txt3: {
    fontWeight: '700',
    fontSize: wp(5),
    color: '#FFFFFF',
  },
  txt4: {
    fontWeight: '500',
    fontSize: wp(3),
  },
  link: {
    fontSize: wp(3.5),
    fontWeight: '700',
    textDecorationLine: 'underline',
    color: 'black',
    marginHorizontal: wp(5),
  },
  nextButton: {
    backgroundColor: '#80D280',
    height: hp(6),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    marginHorizontal: '5%',
    marginBottom: hp(1.5),
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp(4),
  },
});