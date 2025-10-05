import { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const useCollapsible = (controlledState, onToggle) => {
  const [internalState, setInternalState] = useState(false);

  // Determine if the component is controlled or uncontrolled
  const isControlled = controlledState !== undefined;
  const isExpanded = isControlled ? controlledState : internalState;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newState = !isExpanded;

    if (!isControlled) {
      setInternalState(newState);
    }

    if (onToggle) {
      onToggle(newState);
    }
  };

  useEffect(() => {
    // Animate when controlled state changes from the parent
    if (isControlled) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [controlledState, isControlled]);
  return { isExpanded, toggle };
};