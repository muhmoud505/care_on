import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 1. Detect if it's a tablet (common threshold is 600-768 logical pixels)
export const isTablet = SCREEN_WIDTH >= 768;

// 2. Responsive width with a "Max" cap for tablets
export const wp = (percentage) => {
  const value = (percentage / 100) * SCREEN_WIDTH;
  if (isTablet) {
    // On tablets, don't let the 85% width exceed a reasonable size (e.g., 500px)
    const maxValue = 550; 
    return value > maxValue ? maxValue : value;
  }
  return value;
};

export const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;

// ─── Static styles (language-independent) ────────────────────────────────────
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
  profileImg: {
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    overflow: 'hidden',
  },
  ele2: {
    backgroundColor: '#014CC4',
    width: wp(12),
    height: wp(12),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: hp(2),
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
    marginTop: hp(2),
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp(4),
  },
  background: {
    height: hp(8),
    marginTop: hp(1.5),
  },
});

// ─── Dynamic styles (RTL-aware, call with isRTL boolean) ─────────────────────
// Usage in component:
//   const { i18n } = useTranslation();
//   const isRTL = i18n.dir() === 'rtl';
//   const ds = getDynamicStyles(isRTL);
//   <View style={ds.btn} />
//   <View style={ds.cont3} />
//   <View style={ds.ele1} />

export const getDynamicStyles = (isRTL) => ({
  // "Switch to parent / Linked accounts" button — correct corner per direction
  btn: {
    width: wp(30),
    height: hp(4.5),
    borderRadius: 8,
    backgroundColor: '#80D280',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    [isRTL ? 'right' : 'left']: wp(5),
    top: hp(-0.6),
    zIndex: 1,
  },
  // Birth certificate / cont3 section — text flows in reading direction
  cont3: {
    direction: isRTL ? 'rtl' : 'ltr',
    margin: wp(5),
  },
  // Background banner direction
  background: {
    height: hp(8),
    marginTop: hp(1.5),
    direction: isRTL ? 'rtl' : 'ltr',
  },
  // Edit photo icon — bottom corner of avatar on the correct side
  ele1: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4.25),
    width: wp(8.5),
    height: wp(8.5),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: hp(7),
    [isRTL ? 'right' : 'left']: wp(22),
  },
});
