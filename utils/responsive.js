import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Width Percentage
export const wp = (percentage) => (percentage / 100) * SCREEN_WIDTH;

// Height Percentage
export const hp = (percentage) => (percentage / 100) * SCREEN_HEIGHT;